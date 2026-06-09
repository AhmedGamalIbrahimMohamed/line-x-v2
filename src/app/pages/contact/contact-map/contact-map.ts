import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-contact-map',
  standalone: true,
  templateUrl: './contact-map.html',
  styleUrl: './contact-map.scss',
})
export class ContactMap implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) private readonly mapContainer!: ElementRef<HTMLElement>;

  private map?: L.Map;
  private resizeObserver?: ResizeObserver;
  private resizeFrame?: number;

  private readonly locations: { label: string; coordinates: [number, number]; googleMapsUrl: string }[] = [
    {
      label: 'Saudi Arabia Branch',
      coordinates: [24.807735, 46.617356],
      googleMapsUrl:
        'https://www.google.com/maps/place/Line+X+Development/@24.807793821860276,46.617458027345506,20z/data=!4m6!3m5!1s0x3e2ee50035ef9eaf:0x97238a1002ed132b!8m2!3d24.807793821860276!4d46.617458027345506!16s%2Fg%2F11y2pdt0dr',
    },
    {
      label: 'Egypt Branch',
      coordinates: [30.044945918058254, 31.44220289142733],
      googleMapsUrl:
        'https://www.google.com/maps/place/30%C2%B002%2741.8%22N+31%C2%B026%2732.0%22E/@30.044948998432716,31.44285873036098,19z',
    },
    {
      label: 'Turkey Branch',
      coordinates: [40.7583309, 29.853782],
      googleMapsUrl:
        'https://www.google.com/maps/place/L%C4%B0NEX+ORMAN+%C3%9CR%C3%9CNLER%C4%B0+DER%C4%B0NCE+FABR%C4%B0KA/@40.7582496,29.8550568,19z/data=!4m6!3m5!1s0x14cb47703c74d871:0xdc41a15cd0eed0c1!8m2!3d40.7583309!4d29.853782!16s%2Fg%2F11vkbvgt0p?entry=ttu&g_ep=EgoyMDI2MDYwNy4wIKXMDSoASAFQAw%3D%3D',
    },
  ];

  constructor(private readonly ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.resizeFrame = window.requestAnimationFrame(() => {
        this.initMap();
        this.observeMapSize();
      });
    });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    if (this.resizeFrame) {
      window.cancelAnimationFrame(this.resizeFrame);
    }
    this.map?.remove();
  }

  private initMap(): void {
    this.map?.remove();

    this.map = L.map(this.mapContainer.nativeElement, {
      scrollWheelZoom: false,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(this.map);

    this.locations.forEach(({ label, coordinates, googleMapsUrl }) => {
      const markerIcon = L.divIcon({
        className: 'contact-map__marker',
        html: `<span class="contact-map__marker-label">${label}</span><span class="contact-map__marker-dot"></span>`,
        iconSize: [164, 58],
        iconAnchor: [82, 46],
      });

      L.marker(coordinates, { icon: markerIcon })
        .on('click', () => {
          window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
        })
        .addTo(this.map!);
    });

    const bounds = L.latLngBounds(this.locationCoordinates);
    this.map.fitBounds(bounds, {
      padding: [60, 60],
      maxZoom: 6,
    });

    window.setTimeout(() => {
      this.refreshMap(true);
    });
  }

  private observeMapSize(): void {
    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    this.resizeObserver = new ResizeObserver(() => this.refreshMap());
    this.resizeObserver.observe(this.mapContainer.nativeElement);
  }

  private refreshMap(fitBounds = false): void {
    if (!this.map) {
      return;
    }

    window.requestAnimationFrame(() => {
      this.map?.invalidateSize();
      if (fitBounds) {
        this.map?.fitBounds(L.latLngBounds(this.locationCoordinates), {
          padding: [60, 60],
          maxZoom: 6,
        });
      }
    });
  }

  private get locationCoordinates(): [number, number][] {
    return this.locations.map(({ coordinates }) => coordinates);
  }
}
