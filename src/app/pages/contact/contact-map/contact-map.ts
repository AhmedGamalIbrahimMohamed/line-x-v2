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
      label: 'Libya Branch',
      coordinates: [32.1194242, 20.0867909],
      googleMapsUrl:
        'https://www.google.com/maps/place/%D8%A8%D9%86%D8%BA%D8%A7%D8%B2%D9%8A%D8%8C+%D9%84%D9%8A%D8%A8%D9%8A%D8%A7%E2%80%AD/@32.0812715,20.1350005,59129m/data=!3m2!1e3!4b1!4m6!3m5!1s0x13831c55479eee2b:0xe497dfce76d293e0!8m2!3d32.1194242!4d20.0867909!16zL20vMDFjenQ5?entry=ttu&g_ep=EgoyMDI2MDYwNy4wIKXMDSoASAFQAw%3D%3D',
    },
    {
      label: 'UAE Branch',
      coordinates: [25.197197, 55.2743764],
      googleMapsUrl:
        'https://www.google.com/maps/place/%D8%A8%D8%B1%D8%AC+%D8%AE%D9%84%D9%8A%D9%81%D8%A9%E2%80%AD/@25.197197,55.2743764,893m/data=!3m2!1e3!4b1!4m6!3m5!1s0x3e5f43348a67e24b:0xff45e502e1ceb7e2!8m2!3d25.197197!4d55.2743764!16zL20vMDNjbjB2?entry=ttu&g_ep=EgoyMDI2MDYwNy4wIKXMDSoASAFQAw%3D%3D',
    },
    {
      label: 'Oman Branch',
      coordinates: [23.579303, 58.4117477],
      googleMapsUrl:
        'https://www.google.com/maps/place/%D8%A3%D8%AC%D9%86%D8%AD%D8%A9+%D9%81%D8%B1%D9%8A%D8%B2%D8%B1+%D9%85%D8%B3%D9%82%D8%B7%E2%80%AD/@23.5809812,58.3937194,3042m/data=!3m1!1e3!4m9!3m8!1s0x3e91ffab81a1b719:0x1a01ecd54c5d325!5m2!4m1!1i2!8m2!3d23.579303!4d58.4117477!16s%2Fg%2F11g0m57n3n?entry=ttu&g_ep=EgoyMDI2MDYwNy4wIKXMDSoASAFQAw%3D%3D',
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

    this.fitLocations();

    window.setTimeout(() => {
      this.refreshMap(true);
    });
  }

  private observeMapSize(): void {
    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    this.resizeObserver = new ResizeObserver(() => this.refreshMap(true));
    this.resizeObserver.observe(this.mapContainer.nativeElement);
  }

  private refreshMap(fitBounds = false): void {
    if (!this.map) {
      return;
    }

    window.requestAnimationFrame(() => {
      this.map?.invalidateSize();
      if (fitBounds) {
        this.fitLocations();
      }
    });
  }

  private fitLocations(): void {
    if (!this.map) {
      return;
    }

    const width = this.mapContainer.nativeElement.clientWidth;
    const isMobile = width <= 767;
    const isTablet = width <= 1199;

    this.map.fitBounds(L.latLngBounds(this.locationCoordinates), {
      paddingTopLeft: isMobile ? [38, 18] : isTablet ? [52, 36] : [80, 60],
      paddingBottomRight: isMobile ? [18, 40] : isTablet ? [36, 44] : [60, 60],
      maxZoom: isMobile ? 4 : isTablet ? 5 : 6,
    });
  }

  private get locationCoordinates(): [number, number][] {
    return this.locations.map(({ coordinates }) => coordinates);
  }
}
