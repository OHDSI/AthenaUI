import * as React from 'react';
import { Field, SubmissionError } from 'redux-form';
import { Button, Fieldset, FormInput } from 'arachne-ui-components';

interface TextRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  type?: string;
}

// Match Java String.isBlank(), including its treatment of non-breaking spaces.
const blank = /^[\u0009-\u000d\u001c-\u0020\u1680\u2000-\u2006\u2008-\u200a\u2028\u2029\u205f\u3000]*$/;
// The API accepts quoted and international local parts as well as dot-separated atoms.
const atom = "[a-z0-9!#$%&'*+/=?^_`{|}~\\u0080-\\uffff-]+";
const quoted = /"(?:[a-z0-9!#$%&'*.(),<>\[\]:; @+/=?^_`{|}~\u0080-\uffff-]|\\["\\])+"/i;
const word = '(?:' + atom + '|' + quoted.source + ')';
const localPart = new RegExp('^' + word + '(?:\\.' + word + ')*$', 'i');
const domainLabel = /^[a-z0-9!#$%&'*+/=?^_`{|}~\u0080-\uffff]+(?:-+[a-z0-9!#$%&'*+/=?^_`{|}~\u0080-\uffff]+)*$/i;

function validEmail(value: string) {
  const at = value.lastIndexOf('@');
  if (at < 1 || at > 64 || !localPart.test(value.slice(0, at))) return false;
  const domain = value.slice(at + 1);
  if (/^\[\d{1,3}(?:\.\d{1,3}){3}\]$/.test(domain)) return true;
  if (/^\[IPv6:[a-f0-9:.]+\]$/i.test(domain)) {
    try {
      return !!new URL('http://[' + domain.slice(6, -1) + ']').hostname;
    } catch (_) {
      return false;
    }
  }
  return domain.split('.').every(label => label.length <= 63 && domainLabel.test(label));
}

function AccountInput(props) {
  const { required, minLength, maxLength, type } = props;
  return <FormInput {...props} input={{
    ...props.input, required, minLength, maxLength,
    'aria-label': props.placeholder,
    'aria-invalid': !!(props.meta.touched && props.meta.error),
    autoComplete: type === 'password' ? 'new-password' : type === 'email' ? 'email' : undefined,
  }} />;
}

function textField(name: string, placeholder: string, rule: TextRule, tabindex?: number) {
  return {
    name,
    validate(value = '') {
      if (rule.required && blank.test(value)) return 'This field is required.';
      if (rule.minLength && value.length < rule.minLength) return 'Enter at least ' + rule.minLength + ' characters.';
      if (rule.maxLength && value.length > rule.maxLength) return 'Use at most ' + rule.maxLength + ' characters.';
      if (rule.type === 'email' && !validEmail(value)) return 'Enter a valid email address.';
      if (rule.type === 'password' && new TextEncoder().encode(value).length > 72) {
        return 'Use at most 72 UTF-8 bytes for your password.';
      }
    },
    InputComponent: { component: AccountInput, props: { mods: ['bordered'], placeholder, tabindex, ...rule } },
  };
}

const nameRule = { required: true, minLength: 2, maxLength: 255 };
const optionalText = { maxLength: 255 };
const required = { required: true };
const passwordRule = { required: true, type: 'password', minLength: 8 };
export const registrationFields = {
  firstname: textField('firstname', 'First Name', nameRule, 1),
  middlename: textField('middlename', 'Middle Name', optionalText, 2),
  lastname: textField('lastname', 'Last Name', nameRule, 3),
  email: textField('email', 'Email', { required: true, type: 'email', maxLength: 128 }, 4),
  password: textField('password', 'Password', passwordRule, 5),
  organization: textField('organization', 'Organization', nameRule, 6),
  department: textField('department', 'Department', optionalText, 7),
  address: textField('address.address1', 'Address', required, 9),
  city: textField('address.city', 'City', required, 10),
  zipCode: textField('address.zipCode', 'Zip code', required, 11),
  mobile: textField('address.mobile', 'Mobile', required, 14),
};
export const reminderEmail = textField('email', 'Email', { required: true, type: 'email', maxLength: 255 });
export const newPassword = textField('password', 'New password', passwordRule);

// Let Redux Form show all field errors together, including the custom dictionary controls.
export function AccountForm({ fields, submitBtn, doSubmit, handleSubmit, submitting, error }) {
  const submit = handleSubmit(doSubmit);
  return <form className="ac-form" noValidate onSubmit={submit} onKeyDown={event => {
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      submit(event);
    }
  }}>
    {fields.map(field => <Field key={field.name} {...field} component={Fieldset} className="ac-form__group" />)}
    {error && <span className="ac-form__error" role="alert">{error}</span>}
    <div className="ac-form__actions">
      <Button className="ac-form__submit" mods={['submit', 'rounded']} type="submit" disabled={submitting}
        label={submitting ? submitBtn.loadingLabel : submitBtn.label} />
    </div>
  </form>;
}

export function submissionError(error, fallback: string) {
  if (error instanceof SubmissionError) return error;
  return new SubmissionError({ _error: error.errorMessage || error.message || fallback });
}
