import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError, UserError } from 'n8n-workflow';

function cleanString(value: unknown): string | undefined {
	if (typeof value !== 'string') return undefined;
	const trimmed = value.trim();
	return trimmed === '' ? undefined : trimmed;
}

function parseStringList(value: unknown): string[] | undefined {
	if (value === undefined || value === null || value === '') return undefined;

	const raw = Array.isArray(value) ? value : String(value).split(',');
	const items = raw.map((item) => String(item).trim()).filter((item) => item !== '');
	return items.length > 0 ? items : undefined;
}

function parseAudienceId(value: unknown): number | undefined {
	if (value === undefined || value === null || value === '') return undefined;
	if (typeof value === 'number') {
		if (!Number.isFinite(value)) return undefined;
		return value;
	}
	const trimmed = String(value).trim();
	if (trimmed === '') return undefined;
	const parsed = Number(trimmed);
	if (!Number.isFinite(parsed)) {
		throw new UserError('Audience ID must be a number');
	}
	return parsed;
}

function parseOptIn(value: unknown): boolean | undefined {
	if (value === true || value === 'true') return true;
	if (value === false || value === 'false') return false;
	return undefined;
}

export class Cymbal implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Cymbal',
		name: 'cymbal',
		icon: { light: 'file:../../icons/cymbal.svg', dark: 'file:../../icons/cymbal.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Create a contact in Cymbal',
		defaults: {
			name: 'Cymbal',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'cymbalApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://api.cymbal.co',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Contact',
						value: 'contact',
					},
				],
				default: 'contact',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['contact'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						action: 'Create a contact',
						description: 'Create a contact in Cymbal',
					},
				],
				default: 'create',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				placeholder: 'name@example.com',
				description: 'Email or phone is required. Leave blank to omit.',
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['create'],
					},
				},
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				placeholder: '+15551234567',
				description: 'Email or phone is required. Leave blank to omit.',
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['create'],
					},
				},
			},
			{
				displayName: 'First Name',
				name: 'first_name',
				type: 'string',
				default: '',
				description: 'Leave blank to omit',
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['create'],
					},
				},
			},
			{
				displayName: 'Last Name',
				name: 'last_name',
				type: 'string',
				default: '',
				description: 'Leave blank to omit',
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['create'],
					},
				},
			},
			{
				displayName: 'Full Name',
				name: 'full_name',
				type: 'string',
				default: '',
				description: 'Leave blank to omit',
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['create'],
					},
				},
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				typeOptions: {
					multipleValues: true,
				},
				default: [],
				description:
					'Tags that already exist in the Cymbal manager. Allows multiple values. Leave empty to omit.',
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['create'],
					},
				},
			},
			{
				displayName: 'Audience ID',
				name: 'audience_id',
				type: 'string',
				default: '',
				placeholder: '123',
				description:
					'Integer audience ID from the Audience tab URL. Sent as a number. Leave blank to omit.',
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['create'],
					},
				},
			},
			{
				displayName: 'Birthday',
				name: 'birthday',
				type: 'string',
				default: '',
				placeholder: 'YYYY-MM-DD',
				description:
					'Birthday. Accepted formats include YYYY-MM-DD, YYYY-M-D, YYYY/MM/DD, MM/DD/YYYY, and M/D/YYYY. Leave blank to omit.',
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['create'],
					},
				},
			},
			{
				displayName: 'Opt In Email',
				name: 'opt_in_email',
				type: 'options',
				options: [
					{
						name: 'Leave Unchanged',
						value: 'omit',
					},
					{
						name: 'Subscribe',
						value: 'true',
					},
					{
						name: 'Unsubscribe',
						value: 'false',
					},
				],
				default: 'omit',
				description:
					'Maps to opt_ins.email. Omitted when left unchanged (subscription status stays as-is). False unsubscribes the contact.',
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['create'],
					},
				},
			},
			{
				displayName: 'Opt In SMS',
				name: 'opt_in_sms',
				type: 'options',
				options: [
					{
						name: 'Leave Unchanged',
						value: 'omit',
					},
					{
						name: 'Subscribe',
						value: 'true',
					},
					{
						name: 'Unsubscribe',
						value: 'false',
					},
				],
				default: 'omit',
				description:
					'Maps to opt_ins.sms. Omitted when left unchanged (subscription status stays as-is). False unsubscribes the contact.',
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['create'],
					},
				},
			},
			{
				displayName: 'Genres',
				name: 'genres',
				type: 'string',
				typeOptions: {
					multipleValues: true,
				},
				default: [],
				description:
					'Optional. Must match Cymbal’s genre list. Allows multiple values. Leave empty to omit.',
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['create'],
					},
				},
			},
		],
		usableAsTool: true,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				if (resource !== 'contact' || operation !== 'create') {
					throw new NodeOperationError(
						this.getNode(),
						`Unsupported operation: ${resource}.${operation}`,
						{ itemIndex: i },
					);
				}

				const email = cleanString(this.getNodeParameter('email', i, ''));
				const phone = cleanString(this.getNodeParameter('phone', i, ''));
				if (!email && !phone) {
					throw new NodeOperationError(
						this.getNode(),
						'Email or phone is required to create a Cymbal contact.',
						{ itemIndex: i },
					);
				}

				const contact: IDataObject = {};
				if (email) contact.email = email;
				if (phone) contact.phone = phone;

				const firstName = cleanString(this.getNodeParameter('first_name', i, ''));
				if (firstName) contact.first_name = firstName;

				const lastName = cleanString(this.getNodeParameter('last_name', i, ''));
				if (lastName) contact.last_name = lastName;

				const fullName = cleanString(this.getNodeParameter('full_name', i, ''));
				if (fullName) contact.full_name = fullName;

				const tags = parseStringList(this.getNodeParameter('tags', i, []));
				if (tags) contact.tags = tags;

				let audienceId: number | undefined;
				try {
					audienceId = parseAudienceId(this.getNodeParameter('audience_id', i, ''));
				} catch (error) {
					throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
				}
				if (audienceId !== undefined) contact.audience_id = audienceId;

				const birthday = cleanString(this.getNodeParameter('birthday', i, ''));
				if (birthday) contact.birthday = birthday;

				const genres = parseStringList(this.getNodeParameter('genres', i, []));
				if (genres) contact.genres = genres;

				const optIns: IDataObject = {};
				const emailOptIn = parseOptIn(this.getNodeParameter('opt_in_email', i, 'omit'));
				if (emailOptIn !== undefined) optIns.email = emailOptIn;

				const smsOptIn = parseOptIn(this.getNodeParameter('opt_in_sms', i, 'omit'));
				if (smsOptIn !== undefined) optIns.sms = smsOptIn;

				const body: IDataObject = { contact };
				if (Object.keys(optIns).length > 0) body.opt_ins = optIns;

				let response: IDataObject = {};
				try {
					const raw = (await this.helpers.httpRequestWithAuthentication.call(this, 'cymbalApi', {
						method: 'POST',
						url: 'https://api.cymbal.co/v1/partners/contact',
						body,
						json: true,
						headers: {
							'Content-Type': 'application/json',
							Accept: 'application/json',
						},
					})) as IDataObject | string | undefined;

					if (raw && typeof raw === 'object') {
						response = raw;
					}
				} catch (error) {
					throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex: i });
				}

				const output: IDataObject = {
					code: response.code ?? 0,
					message: response.message ?? 'success',
					response: response.response ?? null,
					contact,
				};
				if (Object.keys(optIns).length > 0) output.opt_ins = optIns;

				returnData.push({
					json: output,
					pairedItem: { item: i },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					const message = error instanceof Error ? error.message : 'Unknown error';
					returnData.push({
						json: { error: message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
