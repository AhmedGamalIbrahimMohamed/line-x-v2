import { Component } from '@angular/core';
import { ServicesCapabilities } from './services-capabilities/services-capabilities';
import { ServicesHero } from './services-hero/services-hero';
import { ServicesWorkflow } from './services-workflow/services-workflow';
import { CtaSectionComponent } from '../home/cta-section/cta-section';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [ServicesHero, ServicesCapabilities, ServicesWorkflow, CtaSectionComponent],
  templateUrl: './services.html',
  styleUrl: './services.scss',
})
export class Services {}
