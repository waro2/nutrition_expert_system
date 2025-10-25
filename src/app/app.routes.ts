import { Routes } from '@angular/router';
import { DiagnosticComponent } from './features/diagnostic/diagnostic.component';
import { HistoryComponent } from './features/history/history.component';
import { ResultsComponent } from './features/results/results.component';

export const routes: Routes = [
    { path: '', redirectTo: '/diagnostic', pathMatch: 'full' },
    { path: 'diagnostic', component: DiagnosticComponent },
    { path: 'results', component: ResultsComponent },
    { path: 'history', component: HistoryComponent },
    { path: '**', redirectTo: '/diagnostic' }
];
