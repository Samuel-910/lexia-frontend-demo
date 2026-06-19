import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeamService } from '../../services/team.service';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './team.component.html'
})
export class TeamComponent implements OnInit {
  members: any[] = [];
  inviteEmail: string = '';

  constructor(
    private teamService: TeamService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.teamService.getMembers().subscribe({
      next: (data) => this.members = data
    });
  }

  handleInvite() {
    if (!this.inviteEmail) return;
    this.teamService.inviteMember(this.inviteEmail).subscribe({
      next: (res) => {
        this.alertService.toast(res.message, 'success');
        this.members.push({
          id: Date.now(),
          name: 'Pendiente',
          email: this.inviteEmail,
          role: 'Miembro',
          docs: 0,
          pending: true
        });
        this.inviteEmail = '';
      },
      error: () => this.alertService.error('Error', 'No se pudo enviar la invitación')
    });
  }
}
