import * as mailjet from 'node-mailjet';
import { ConnectOptions, Email } from 'node-mailjet';
import { Payload, Status, ErrorResponse } from './types';

export default class MailjetSubscriptionHelpers {
  private instance: Email.Client;
  constructor(api_key: string, api_secret: string, options?: ConnectOptions) {
    this.instance = mailjet.connect(api_key, api_secret) as Email.Client;
  }

  static connect(api_key: string, api_secret: string, options?: ConnectOptions) {
    return new this(api_key, api_secret, options);
  }

  private getMailjetResponseStatus(response: Email.PostResponseData): Status.SUCCESS | Status.ERROR {
    let status = Status.ERROR;
    if (response && response.Messages[0] && response.Messages[0] && response.Messages[0].Status) {
      status = response.Messages[0].Status as Status.SUCCESS | Status.ERROR;
    }

    return status;
  }

  public sendSubscriptionEmail(data: Payload): Promise<Email.Response> {
    return this.instance.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: process.env.SENDER_EMAIL,
            Name: process.env.SENDER_NAME,
          },
          To: [
            {
              Email: data.email,
              ...(data.name && { Name: 'You' }),
            },
          ],
          Subject: `Email verification for ${process.env.DOMAIN_NAME}`,
          TemplateID: 1602680,
          TemplateLanguage: true,
          Variables: {
            url: `${process.env.SITE_URL}${process.env.CONFIRMATION_URL_PATH}?token=${data.token}`,
          },
        },
      ],
    });
  }

  public addContactToList(
    data: Payload,
    IsUnsubscribed = 'false',
    ListID = process.env.LIST_ID,
  ): Promise<Email.Response> {
    return this.instance.post('listrecipient', { version: 'v3' }).request({
      IsUnsubscribed,
      ContactAlt: data.email,
      ListID,
    });
  }

  public emailSent(response: Email.PostResponseData) {
    return this.getMailjetResponseStatus(response) === Status.SUCCESS;
  }

  public contactAdded(code: number) {
    return code === 201;
  }

  // ErrorMessage: 'A duplicate ListRecipient already exists.',
  public duplicateEmail(error: ErrorResponse) {
    return error.StatusCode === 400;
  }
}
