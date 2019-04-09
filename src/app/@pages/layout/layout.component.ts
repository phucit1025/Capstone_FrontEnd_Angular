import {Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {AuthService} from '../../page-services/auth.service';
import {UserService} from '../../page-services/user.service';
import { NotificationService } from '../../page-services/notification.service';
import {ConfirmMedicalService} from '../../page-services/confirm.service';
import {ActivatedRoute, Router} from '@angular/router';
import { Location } from '@angular/common';
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
  HOST = 'https://localhost:44372/';
  // HOST = 'http://172.20.10.7:5000/';
  SUPPLIER_ROLE = 'MedicalSupplier';
  CHIEFNURSE_ROLE = 'ChiefNurse';

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
              private notificationMessage: NotificationService,
              private location: Location ) {
  }
 
  private _hubConnection: HubConnection;
  msgsSupplier = [];
  msgsChiefNurse = [];
  countNotiSup = 0;
  countNotiChief = 0;
  ngOnInit() {
    this.user.sb = this.userSV.getUser.subscribe(user => {
      this.user.data = user;
    });
    this.loadNotification(this.user.data.role);

    this._hubConnection = new HubConnectionBuilder()
    .withUrl(this.HOST + 'notify').build();
    this._hubConnection
      .start()
      .then(() => console.log('Connection started!'))
      .catch(err => console.log('Error while establishing connection :('));
 
    this._hubConnection.on('BroadcastMessage', (roleName, messages) => {
      if (roleName == this.SUPPLIER_ROLE) {
        this.msgsSupplier = messages;
        this.countNotiSup = this.msgsSupplier.filter(item => item.isRead == false).length;
      }
      if (roleName == this.CHIEFNURSE_ROLE) {
        this.msgsChiefNurse = messages;
        this.countNotiChief = this.msgsChiefNurse.filter(item => item.isRead == false).length;
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
      if (roleName == this.SUPPLIER_ROLE) {
        this.msgsSupplier = messages;
        this.countNotiSup = this.msgsSupplier.filter(item => item.isRead == false).length;
      }
      if (roleName == this.CHIEFNURSE_ROLE) {
      this.msgsChiefNurse  = messages;
      this.countNotiChief = this.msgsChiefNurse.filter(item => item.isRead == false).length;
      }
    });
  }

  SetIsReadNotification(notiId, roleName) {
    if (this.countNotiSup > 0 || this.countNotiChief > 0) {
      this.notificationMessage.setIsReadNotification(notiId).subscribe(() => {
        this.loadNotification(roleName);
      });
    }
  }

  LoadConfirmPage():void {
    // this.location.back();
    this.router.navigate(['/pages/confirm-medical']);
    // this.location.();
  }

  createBasicNotification(): void {
    this.notification.blank(
      'Notification Title',
      'This is the content of the notification. This is the content of the notification. This is the content of the notification.'
    );
  }
}
