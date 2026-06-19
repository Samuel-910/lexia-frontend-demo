import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

import { DocumentsComponent } from './pages/documents/documents.component';
import { ChatComponent } from './pages/chat/chat.component';
import { AnalyzeComponent } from './pages/analyze/analyze.component';
import { GenerateComponent } from './pages/generate/generate.component';
import { IncorporationComponent } from './pages/incorporation/incorporation.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { TeamComponent } from './pages/team/team.component';
import { AdminRagComponent } from './pages/admin-rag/admin-rag.component';
import { LawsComponent } from './pages/laws/laws.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'registro', component: RegisterComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'reset-password', component: ResetPasswordComponent },
    { 
        path: '', 
        component: MainLayoutComponent,
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'documentos', component: DocumentsComponent },
            { path: 'generar', component: GenerateComponent },
            { path: 'constituir', component: IncorporationComponent },
            { path: 'chat', component: ChatComponent },
            { path: 'analizar', component: AnalyzeComponent },
            { path: 'config', component: SettingsComponent },
            { path: 'equipo', component: TeamComponent },
            { path: 'leyes', component: LawsComponent },
            { path: 'admin/rag', component: AdminRagComponent }
        ]
    },
    { path: '**', redirectTo: 'login' }
];
