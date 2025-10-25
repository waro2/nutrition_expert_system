import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DiagnosticComponent } from './features/diagnostic/diagnostic.component';
import { HistoryComponent } from './features/history/history.component';

const routes: Routes = [
    { path: '', redirectTo: 'diagnostic', pathMatch: 'full' },
    { path: 'diagnostic', component: DiagnosticComponent },
    { path: 'history', component: HistoryComponent },
    { path: '**', redirectTo: 'diagnostic' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
