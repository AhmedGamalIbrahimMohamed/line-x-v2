import { Component } from '@angular/core';
import { ContactForm } from './contact-form/contact-form';
import { ContactHero } from './contact-hero/contact-hero';
import { ContactInfo } from './contact-info/contact-info';
import { ContactMap } from './contact-map/contact-map';
import { CtaSectionComponent } from '../home/cta-section/cta-section';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ContactHero, ContactForm, ContactInfo, ContactMap, CtaSectionComponent],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {}
