// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { It, Mock, Times } from 'typemoq';

import { BrowserAdapter } from '../../../../../background/browser-adapters/browser-adapter';
import { BaseStore } from '../../../../../common/base-store';
import { EnvironmentInfo } from '../../../../../common/environment-info-provider';
import { CreateIssueDetailsTextData } from '../../../../../common/types/create-issue-details-text-data';
import {
    IssueFilingServicePropertiesMap,
    UserConfigurationStoreData,
} from '../../../../../common/types/store-data/user-configuration-store';
import { DecoratedAxeNodeResult } from '../../../../../injected/scanner-utils';
import { IssueFilingControllerImpl } from '../../../../../issue-filing/common/issue-filing-controller-impl';
import { IssueFilingServiceProvider } from '../../../../../issue-filing/issue-filing-service-provider';
import { IssueFilingService } from '../../../../../issue-filing/types/issue-filing-service';

describe('IssueFilingControllerImpl', () => {
    it('fileUssue', () => {
        const serviceKey = 'test-service';
        const issueData: CreateIssueDetailsTextData = {
            pageTitle: 'pageTitle<x>',
            pageUrl: 'pageUrl',
            ruleResult: {
                failureSummary: 'RR-failureSummary',
                guidanceLinks: [{ text: 'WCAG-1.4.1' }, { text: 'wcag-2.8.2' }],
                help: 'RR-help',
                html: 'RR-html',
                ruleId: 'RR-rule-id',
                helpUrl: 'RR-help-url',
                selector: 'RR-selector<x>',
                snippet: 'RR-snippet   space',
            } as DecoratedAxeNodeResult,
        };
        const environmentInfoStub: EnvironmentInfo = {
            axeCoreVersion: 'test axe version',
            browserSpec: 'test browser spec',
            extensionVersion: 'test extension version',
        };
        const testUrl = 'test-url';
        const map: IssueFilingServicePropertiesMap = {
            [serviceKey]: {
                repository: testUrl,
            },
        };
        const serviceConfig = { bugServicePropertiesMap: map } as UserConfigurationStoreData;

        const issueFilingServiceMock = Mock.ofType<IssueFilingService>();
        issueFilingServiceMock
            .setup(service => service.getSettingsFromStoreData(serviceConfig.bugServicePropertiesMap))
            .returns(() => serviceConfig);
        issueFilingServiceMock
            .setup(service => service.issueFilingUrlProvider(It.isValue(serviceConfig), issueData, environmentInfoStub))
            .returns(() => testUrl);

        const providerMock = Mock.ofType<IssueFilingServiceProvider>();
        providerMock.setup(provider => provider.forKey(serviceKey)).returns(() => issueFilingServiceMock.object);

        const browserAdapterMock = Mock.ofType<BrowserAdapter>();
        browserAdapterMock.setup(adapter => adapter.createTab(testUrl)).verifiable(Times.once());

        const storeMock = Mock.ofType<BaseStore<UserConfigurationStoreData>>();
        storeMock.setup(store => store.getState()).returns(() => serviceConfig);

        const testSubject = new IssueFilingControllerImpl(
            providerMock.object,
            browserAdapterMock.object,
            environmentInfoStub,
            storeMock.object,
        );

        testSubject.fileIssue(serviceKey, issueData);

        browserAdapterMock.verifyAll();
    });
});
