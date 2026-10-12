import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class CymbalApi implements ICredentialType {
	name = 'cymbalApi';

	displayName = 'Cymbal API';

	icon: Icon = { light: 'file:../icons/cymbal.svg', dark: 'file:../icons/cymbal.dark.svg' };

	documentationUrl = 'https://docs.cymbal.co/help/partners';

	properties: INodeProperties[] = [
		{
			displayName: 'Partner API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'Partner API key from the Cymbal manager. Sent as the Cymbal-Partner-API-Key header.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'Cymbal-Partner-API-Key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.cymbal.co',
			url: '/v1/partners/pages',
			method: 'GET',
		},
	};
}
