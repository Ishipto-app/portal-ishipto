import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

export type TimeRangeFilter = 'all' | 'today' | 'week' | 'month';

interface PortDistribution {
  name: string;
  count: number;
  percentage: number;
}

interface CarrierDistribution {
  name: string;
  count: number;
  percentage: number;
}

interface CommodityDistribution {
  name: string;
  count: number;
  percentage: number;
}

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './overview.component.html',
  styleUrls: []
})
export class OverviewComponent implements OnInit {
  

  ngOnInit(): void {
  }

}
