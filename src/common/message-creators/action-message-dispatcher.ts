// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { PayloadWithEventName } from '../../background/actions/action-payloads';
import { InterpreterMessage, Message } from '../message';
import { Messages } from '../messages';
import { TelemetryData } from '../telemetry-events';

export class ActionMessageDispatcher {
    constructor(private postMessageDelegate: (message: InterpreterMessage) => void, private tabId: number) {}

    public dispatchMessage(message: Message): void {
        const interpreterMessage = this.decorateWithTabId(message);

        this.postMessageDelegate(interpreterMessage);
    }

    public dispatchType(messageType: string): void {
        this.dispatchMessage({
            messageType,
        });
    }

    public sendTelemetry(eventName: string, eventData: TelemetryData): void {
        const payload: PayloadWithEventName = {
            eventName: eventName,
            telemetry: eventData,
        };

        const message: Message = {
            messageType: Messages.Telemetry.Send,
            payload,
        };

        this.dispatchMessage(message);
    }

    private decorateWithTabId(message: Message): InterpreterMessage {
        const decorated: InterpreterMessage = {
            ...message,
        };

        if (this.tabId != null) {
            decorated.tabId = this.tabId;
        }

        return decorated;
    }
}
