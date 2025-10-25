
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatToolbarModule, MatIconModule, MatButtonModule],
  template: `
    <div class="app-container">
      <mat-toolbar color="primary" class="app-toolbar">
        <mat-icon class="toolbar-icon">psychology</mat-icon>
        <span class="app-title">Système Expert Nutritionnel</span>
        
        <span class="toolbar-spacer"></span>
        
        <nav class="toolbar-nav">
          <a mat-button routerLink="/diagnostic" routerLinkActive="active">
            <mat-icon>assignment</mat-icon>
            Diagnostic
          </a>
          <a mat-button routerLink="/history" routerLinkActive="active">
            <mat-icon>history</mat-icon>
            Historique
          </a>
        </nav>
      </mat-toolbar>
      
      <main class="app-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .app-toolbar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      z-index: 1000;
    }

    .toolbar-icon {
      font-size: 1.5rem;
      width: 1.5rem;
      height: 1.5rem;
      margin-right: 12px;
    }

    .app-title {
      font-size: 1.2rem;
      font-weight: 500;
    }

    .toolbar-spacer {
      flex: 1 1 auto;
    }

    .toolbar-nav {
      display: flex;
      gap: 8px;

      a {
        color: rgba(255, 255, 255, 0.9);
        text-decoration: none;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        border-radius: 4px;
        transition: all 0.3s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        &.active {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        mat-icon {
          font-size: 1.2rem;
          width: 1.2rem;
          height: 1.2rem;
        }
      }
    }

    .app-content {
      flex: 1;
      overflow: auto;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      min-height: calc(100vh - 64px);
    }

    @media (max-width: 768px) {
      .toolbar-nav {
        gap: 4px;

        a {
          padding: 6px 12px;
          font-size: 0.9rem;

          span {
            display: none;
          }
        }
      }

      .app-title {
        font-size: 1rem;
      }
    }
  `]
})
export class AppComponent {
  title = 'nutrition-expert-system';
}