import { Component } from '@angular/core';
import { ContactCta } from './contact-cta/contact-cta';
import { ContactForm } from './contact-form/contact-form';
import { ContactHero } from './contact-hero/contact-hero';
import { ContactInfo } from './contact-info/contact-info';
import { ContactMap } from './contact-map/contact-map';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ContactHero, ContactForm, ContactInfo, ContactMap, ContactCta],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {}
