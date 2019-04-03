import {Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {AuthService} from '../../page-services/auth.service';
import {UserService} from '../../page-services/user.service';
import { NotificationService } from '../../page-services/notification.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import 'rxjs/add/operator/mergeMap';
import { NzNotificationService } from 'ng-zorro-antd';

import {HubConnection, HubConnectionBuilder} from '@aspnet/signalr';
@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit, OnDestroy {
  menu = [
    {
      icon: 'file-excel',
      name: 'Import File',
      link: '/pages/import-file',
      roles: ['HospitalStaff']
    },
    {
      icon: 'file-search',
      name: 'Confirm Medical',
      link: '/pages/confirm-medical',
      roles: ['MedicalSupplier']
    },
    {
      icon: 'calendar',
      name: 'Schedule',
      link: '/pages/schedule',
      roles: ['ChiefNurse']
    }
  ];
  isCollapsed = true;
  triggerTemplate = null;
  user = {
    data: null,
    sb: null
  };
  
  @ViewChild('trigger') customTrigger: TemplateRef<void>;

  constructor(private auth: AuthService, private userSV: UserService,
              private router: Router, private activedRoute: ActivatedRoute,
              private notification: NzNotificationService,
              private notificationMessage: NotificationService ) {
  }
 
  private _hubConnection: HubConnection;
  msgs = [];
  countNoti = 0;
  ngOnInit() {
    this.user.sb = this.userSV.getUser.subscribe(user => {
      this.user.data = user;
    });
    this.loadNotification(this.user.data.role);

    this._hubConnection = new HubConnectionBuilder()
    .withUrl('https://localhost:44372/notify').build();
    this._hubConnection
      .start()
      .then(() => console.log('Connection started!'))
      .catch(err => console.log('Error while establishing connection :('));
 

    this._hubConnection.on('GetNotifications', (roleName, messages) => {
      if (roleName == this.user.data.role) {
        this.msgs = messages;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.user.sb) {
      this.user.sb.unsubscribe();
    }
  }

  logout() {
    this.auth.logout();
  }

  /** custom trigger can be TemplateRef **/
  changeTrigger(): void {
    this.triggerTemplate = this.customTrigger;
  }

  loadNotification(roleName) {
    this.notificationMessage.getNotification(roleName).subscribe((messages: any) => {
      this.msgs = messages;
      this.countNoti = this.msgs.filter(item => item.isRead == false).length;
    });
  }

  SetIsReadNotification(roleName) {
    if (this.countNoti > 0) {
      this.notificationMessage.setIsReadNotification(roleName).subscribe(() => {
        this.loadNotification(roleName);
      });
    }
  }

  createBasicNotification(): void {
    this.notification.blank(
      'Notification Title',
      'This is the content of the notification. This is the content of the notification. This is the content of the notification.'
    );
  }
}
