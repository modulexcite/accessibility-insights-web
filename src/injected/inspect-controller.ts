// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { autobind } from '@uifabric/utilities';
import { InspectMode } from '../background/inspect-modes';
import { BaseStore } from '../common/base-store';
import { ConfigurationKey, InspectConfigurationFactory } from '../common/configs/inspect-configuration-factory';
import { InspectStoreData } from '../common/types/store-data/inspect-store-data';
import { ScopingListener } from './scoping-listener';

export class InspectController {
    private currentMode: InspectMode;

    constructor(
        private readonly inspectStore: BaseStore<InspectStoreData>,
        private readonly scopingListener: ScopingListener,
        private readonly changeInspectMode: (event: React.MouseEvent<HTMLElement> | MouseEvent, inspectMode: InspectMode) => void,
        private readonly inspectConfigurationFactory: InspectConfigurationFactory,
        private readonly onHover: (selector: string[]) => void,
    ) {}

    public listenToStore(): void {
        this.inspectStore.addChangedListener(this.onChangedState);
        this.onChangedState();
    }

    @autobind
    private onChangedState(): void {
        if (this.inspectStore.getState() == null) {
            return;
        }

        const newInspectStoreState = this.inspectStore.getState();
        this.currentMode = newInspectStoreState.inspectMode;

        if (newInspectStoreState != null && this.currentMode !== InspectMode.off) {
            this.scopingListener.start(this.onInspectClick, this.onHover);
        }
    }

    @autobind
    private onInspectClick(event: MouseEvent, selector: string[]): void {
        this.scopingListener.stop();
        this.inspectConfigurationFactory.getConfigurationByKey(this.currentMode as ConfigurationKey)(event, selector);
        this.changeInspectMode(event, InspectMode.off);
    }
}
