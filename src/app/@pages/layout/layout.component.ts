import {Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {AuthService} from '../../page-services/auth.service';
import {UserService} from '../../page-services/user.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import 'rxjs/add/operator/mergeMap';

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
              private router: Router, private activedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.user.sb = this.userSV.getUser.subscribe(user => {
      this.user.data = user;
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


}
