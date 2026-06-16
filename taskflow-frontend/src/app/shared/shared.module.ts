import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Angular Material
import { MatButtonModule }       from '@angular/material/button';
import { MatIconModule }         from '@angular/material/icon';
import { MatInputModule }        from '@angular/material/input';
import { MatFormFieldModule }    from '@angular/material/form-field';
import { MatCardModule }         from '@angular/material/card';
import { MatTableModule }        from '@angular/material/table';
import { MatPaginatorModule }    from '@angular/material/paginator';
import { MatSortModule }         from '@angular/material/sort';
import { MatDialogModule }       from '@angular/material/dialog';
import { MatSelectModule }       from '@angular/material/select';
import { MatSlideToggleModule }  from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule }  from '@angular/material/progress-bar';
import { MatTooltipModule }      from '@angular/material/tooltip';
import { MatChipsModule }        from '@angular/material/chips';
import { MatMenuModule }         from '@angular/material/menu';
import { MatSnackBarModule }     from '@angular/material/snack-bar';
import { MatDividerModule }      from '@angular/material/divider';
import { MatBadgeModule }        from '@angular/material/badge';
import { MatTabsModule }         from '@angular/material/tabs';

// Shared components
import { NavbarComponent }         from './components/navbar/navbar.component';
import { SidebarComponent }        from './components/sidebar/sidebar.component';
import { ConfirmDialogComponent }  from './components/confirm-dialog/confirm-dialog.component';

const MATERIAL = [
  MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule,
  MatCardModule, MatTableModule, MatPaginatorModule, MatSortModule,
  MatDialogModule, MatSelectModule, MatSlideToggleModule,
  MatProgressSpinnerModule, MatProgressBarModule, MatTooltipModule,
  MatChipsModule, MatMenuModule, MatSnackBarModule, MatDividerModule,
  MatBadgeModule, MatTabsModule
];

@NgModule({
  declarations: [
    NavbarComponent,
    SidebarComponent,
    ConfirmDialogComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    ...MATERIAL
  ],
  exports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    NavbarComponent,
    SidebarComponent,
    ConfirmDialogComponent,
    ...MATERIAL
  ]
})
export class SharedModule {}
