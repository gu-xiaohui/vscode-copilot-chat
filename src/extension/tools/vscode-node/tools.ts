/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { Disposable } from '../../../util/vs/base/common/lifecycle';
import { getContributedToolName } from '../common/toolNames';
import { IToolsService } from '../common/toolsService';

import { IExperimentationService } from '../../../platform/telemetry/common/nullExperimentationService';
import { IToolGroupingCache, IToolGroupingService } from '../common/virtualTools/virtualToolTypes';
import '../node/allTools';
import './allTools';

export class ToolsContribution extends Disposable {
	constructor(
		@IToolsService toolsService: IToolsService,
		@IToolGroupingCache toolGrouping: IToolGroupingCache,
		@IToolGroupingService toolGroupingService: IToolGroupingService,
		@IExperimentationService experimentationService: IExperimentationService
	) {
		super();

		for (const [name, tool] of toolsService.copilotTools) {
			this._register(vscode.lm.registerTool(getContributedToolName(name), tool));
		}

		this._register(vscode.commands.registerCommand('github.copilot.debug.resetVirtualToolGroups', async () => {
			await toolGrouping.clear();
			vscode.window.showInformationMessage('Tool groups have been reset. They will be regenerated on the next agent request.');
		}));

		experimentationService.initializePromise.then(() => {
			vscode.commands.executeCommand('setContext', 'chat.toolGroupingThreshold', toolGroupingService.threshold);
		});
	}
}
