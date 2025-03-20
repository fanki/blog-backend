import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-moderation-dialog',
  standalone: true,
  imports: [MatDialogModule],
  template: `
    <h2 mat-dialog-title>⚠️ Inhalt problematisch</h2>
    <mat-dialog-content>
      <p>Dieser Blog-Post enthält möglicherweise unangemessene Inhalte.</p>
      <p>Bitte überarbeite den Inhalt, bevor du ihn einreichst.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Ok</button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 {
      color: #d32f2f;               
      font-weight: bold;
      margin-bottom: 1rem;
    }

    mat-dialog-content {
      font-size: 1rem;
      color: #333;
    }

    mat-dialog-content p {
      margin: 0 0 0.5rem 0;
      line-height: 1.4;
    }

    mat-dialog-actions {
      margin-top: 1rem;
    }

    button[mat-button] {
      background-color: #d32f2f;
      color: #fff;
      font-weight: 600;
      padding: 0.5rem 1.2rem;
      border-radius: 4px;
      transition: background-color 0.3s ease;
    }

    button[mat-button]:hover {
      background-color: #b71c1c;
    }
  `]
})
export class ModerationDialogComponent {}
