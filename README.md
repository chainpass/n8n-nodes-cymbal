# @cymbal/n8n-nodes-cymbal

This is an n8n community node. It lets you create contacts in [Cymbal](https://cymbal.co) from your n8n workflows using the [Cymbal Partners API](https://docs.cymbal.co/help/partners).

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation) · [Operations](#operations) · [Credentials](#credentials) · [Usage](#usage) · [Compatibility](#compatibility) · [Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

In n8n, go to **Settings → Community Nodes → Install** and enter:

```
@cymbal/n8n-nodes-cymbal
```

## Operations

**Contact**

- **Create**: create (or update) a contact in Cymbal via `POST https://api.cymbal.co/v1/partners/contact`.

## Credentials

You need a Cymbal **Partner API Key**.

1. Sign in to the Cymbal manager for your organization.
2. Create a partner API key (see the [Cymbal Partners API docs](https://docs.cymbal.co/help/partners)).
3. In n8n, create a new **Cymbal API** credential and paste the key into **Partner API Key**.
4. Click **Test**. n8n calls `GET https://api.cymbal.co/v1/partners/pages` to check the key.

The key is sent on every request in the `Cymbal-Partner-API-Key` header. A `403` response means the key is invalid or was revoked.

## Usage

Add the **Cymbal** node, choose **Contact → Create**, and map fields from earlier steps:

| Field | Notes |
| --- | --- |
| Email / Phone | At least one is required. The item fails if both are blank. |
| **Additional Fields** | Expand to add optional fields: |
| ↳ First Name, Last Name, Full Name | Optional. |
| ↳ Tags | Optional, multiple values. Tags must already exist in Cymbal. |
| ↳ Audience ID | Optional number. |
| ↳ Birthday | Optional, `YYYY-MM-DD`. |
| ↳ Opt In Email / Opt In SMS | **Leave Unchanged** (default), **Subscribe**, or **Unsubscribe**. |
| ↳ Genres | Optional, multiple values from Cymbal's genre list. |

Blank or omitted fields are left out of the request, so they never overwrite existing data.

### Example workflow

1. **Form Trigger** (or a webhook, Typeform, Shopify, and so on) collects `email` and `first_name`.
2. **Cymbal → Contact → Create** with Email = `{{ $json.email }}`, First Name = `{{ $json.first_name }}`, Opt In Email = **Subscribe**.

Cymbal responds `201` with `{ "code": 0, "message": "success" }`. Contacts are created asynchronously, so no contact ID is returned. The node outputs the API response plus the `contact` and `opt_ins` it sent, so later steps can use those values.

The node can also be used as a tool by n8n AI Agents.

## Compatibility

Built with `@n8n/node-cli` and tested with n8n 1.x (Nodes API version 1). The package has no runtime dependencies.

## Resources

- [Cymbal Partners API documentation](https://docs.cymbal.co/help/partners)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)

## Version history

- **0.1.2**: Moved optional fields into "Additional Fields" collection per n8n review guidelines. Removed unused `requestDefaults` block.
- **0.1.1**: Moved to the official n8n-node tooling, added themed icons, AI-tool support, stricter error handling, and full README. Published with GitHub Actions provenance.
- **0.1.0**: Initial release with Contact → Create.

## License

[MIT](LICENSE.md)
