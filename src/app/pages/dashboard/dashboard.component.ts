import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { TransportService, Booking, Shipment } from '../../core/transport.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    MatToolbarModule, 
    MatSlideToggleModule, 
    MatInputModule, 
    MatButtonModule, 
    MatTableModule, 
    FormsModule
  ],
  template: `
    <!-- HEADER -->
    <mat-toolbar color="primary" class="header">
      <span>SEL Hệ thống Vận tải</span>
      <span class="spacer"></span>
      
      <mat-form-field appearance="outline" class="search-bar" subscriptSizing="dynamic">
        <mat-label>Tìm Booking/Shipment...</mat-label>
        <input matInput [(ngModel)]="searchTerm" placeholder="Nhập mã, KH, cảng...">
      </mat-form-field>

      <mat-slide-toggle [checked]="(showBooking$ | async) ?? false" (change)="toggleBooking()" class="toggle-btn">
        Khung Booking
      </mat-slide-toggle>
      <mat-slide-toggle [checked]="(showShipment$ | async) ?? false" (change)="toggleShipment()" class="toggle-btn">
        Khung Shipment
      </mat-slide-toggle>

      <button mat-flat-button color="warn" class="logout-btn" (click)="logout()">
        Đăng xuất
      </button>
    </mat-toolbar>

    <!-- CONTENT BODY -->
    <div class="content-container">
      
      <!-- KHUNG TRÊN: BOOKING -->
      <div *ngIf="showBooking$ | async" class="frame-box booking-frame">
        <h2>Khung Trên: Đơn Đặt Chỗ (SEL_BOOKING) chờ xử lý</h2>
        <div class="table-scroll">
          <table mat-table [dataSource]="bookings$" class="mat-elevation-z8">
            
            <ng-container matColumnDef="bookingNo">
              <th mat-header-cell *matHeaderCellDef> Số Booking </th>
              <td mat-cell *matCellDef="let element"> {{element.bookingNo}} </td>
            </ng-container>

            <ng-container matColumnDef="customer">
              <th mat-header-cell *matHeaderCellDef> Khách hàng </th>
              <td mat-cell *matCellDef="let element"> {{element.customer}} </td>
            </ng-container>

            <ng-container matColumnDef="route">
              <th mat-header-cell *matHeaderCellDef> Lộ trình (POL -> POD) </th>
              <td mat-cell *matCellDef="let element"> {{element.portOfLoading}} ➔ {{element.portOfDischarge}} </td>
            </ng-container>

            <ng-container matColumnDef="action">
              <th mat-header-cell *matHeaderCellDef> Thao tác </th>
              <td mat-cell *matCellDef="let element"> 
                <button mat-raised-color="accent" style="background-color: #ff4081; color: white;" (click)="moveToShipment(element)">
                  Chuyển sang Shipment
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="bookingColumns; sticky: true"></tr>
            <tr mat-row *matRowDef="let row; columns: bookingColumns;"></tr>
          </table>
        </div>
      </div>

      <!-- KHUNG DƯỚI: SHIPMENT -->
      <div *ngIf="showShipment$ | async" class="frame-box shipment-frame">
        <h2>Khung Dưới: Chuyến Vận Chuyển Thực Tế (SEL_SHIPMENT)</h2>
        <div class="table-scroll">
          <table mat-table [dataSource]="shipments$" class="mat-elevation-z8">
            
            <ng-container matColumnDef="shipmentNo">
              <th mat-header-cell *matHeaderCellDef> Số Shipment </th>
              <td mat-cell *matCellDef="let element"> <b>{{element.shipmentNo}}</b> </td>
            </ng-container>

            <ng-container matColumnDef="bookingRef">
              <th mat-header-cell *matHeaderCellDef> Từ Booking </th>
              <td mat-cell *matCellDef="let element"> {{element.bookingRef}} </td>
            </ng-container>

            <ng-container matColumnDef="customer">
              <th mat-header-cell *matHeaderCellDef> Khách hàng </th>
              <td mat-cell *matCellDef="let element"> {{element.customer}} </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef> Trạng thái </th>
              <td mat-cell *matCellDef="let element"> 
                <span class="status-badge">{{element.status}}</span>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="shipmentColumns; sticky: true"></tr>
            <tr mat-row *matRowDef="let row; columns: shipmentColumns;"></tr>
          </table>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .header { display: flex; align-items: center; padding: 0 20px; }
    .spacer { flex: 1 1 auto; }
    .search-bar { width: 300px; margin-right: 20px; background: white; border-radius: 4px; }
    .toggle-btn { margin-left: 15px; color: white; }
    .logout-btn { margin-left: 25px; }
    
    .content-container { 
      padding: 20px; 
      display: flex; 
      flex-direction: column; 
      gap: 20px; 
      height: calc(100vh - 64px);
      box-sizing: border-box;
    }
    .frame-box { 
      border: 1px solid #ccc; 
      border-radius: 8px; 
      padding: 15px; 
      background: #fafafa; 
      display: flex; 
      flex-direction: column;
      flex: 1; 
      min-height: 0; 
    }
    
    .table-scroll { 
      flex: 1; 
      overflow-y: auto; 
    }
    
    table { width: 100%; }
    .status-badge { background: #4caf50; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; }
  `]
})
export class DashboardComponent implements OnInit {
  searchTerm: string = '';
  
  bookingColumns: string[] = ['bookingNo', 'customer', 'route', 'action'];
  shipmentColumns: string[] = ['shipmentNo', 'bookingRef', 'customer', 'status'];

  showBooking$: Observable<boolean>;
  showShipment$: Observable<boolean>;
  bookings$: Observable<Booking[]>;
  shipments$: Observable<Shipment[]>;

  constructor(
    private transportService: TransportService,
    private router: Router
  ) {
    this.showBooking$ = this.transportService.showBookingFrame$;
    this.showShipment$ = this.transportService.showShipmentFrame$;
    this.bookings$ = this.transportService.bookings$;
    this.shipments$ = this.transportService.shipments$;
  }

  ngOnInit() {
    this.transportService.fetchBookings();
  }

  toggleBooking() { 
    this.transportService.toggleBookingFrame(); 
  }
  
  toggleShipment() { 
    this.transportService.toggleShipmentFrame(); 
  }

  moveToShipment(booking: Booking) {
    this.transportService.moveToShipment(booking);
  }

  logout() {
    this.router.navigate(['/login']);
  }
}