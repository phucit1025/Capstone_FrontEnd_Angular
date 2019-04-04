import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd';
import {GLOBAL} from '../../global';
import {ImportService} from '../../page-services/import.service';
import {NotificationService} from '../../page-services/notification.service';
import {combineLatest} from 'rxjs';

import {LayoutComponent} from '../layout/layout.component';

@Component({
  selector: 'app-import-file',
  templateUrl: './import-file.component.html',
  styleUrls: ['./import-file.component.css']
})
export class ImportFileComponent implements OnInit {
  @ViewChild('file') file: ElementRef;
  state = {
    load: false,
    isVisible: false
  };
  curYear = new Date().getFullYear();
  data = [];
  medicals = [];
  mapOfCheckedId: { [key: string]: boolean } = {};
  isAllCheck = false;
  selectedObject = null;


  constructor(private message: NzMessageService, private importSV: ImportService,
    private layoutData: LayoutComponent, private notificationService:NotificationService) {
  }

  ngOnInit() {
    const data = JSON.parse(localStorage.getItem('file'));
    if (data && data instanceof Array) {
      this.data = data;
    }
  }

  showModal(item) {
    this.selectedObject = item;
    this.state.isVisible = true;
  }

  async handleFile(e) {
    this.state.load = true;
    const file = e.target.files[0];
    if (file) {
      const data = await GLOBAL.readFileExcel(file);
      if (data && data.length > 1) {
        this.medicals = data[1];
        const len = this.data.length;
        this.data = this.data.concat(data[0].map((patient: any, index: number) => {
          patient.index = len + index;
          patient.gender = patient.gender === 'F' ? 0 : 1;
          patient.patientID = patient.patientId;
          patient.priority = patient.priority;
          patient.surgeryShiftID = patient.surgeryShiftId;
          patient.surgeryCatalogID = patient.surgeryCode;
          patient.yearOfBirth = patient.patientDob;
          patient.expectedSurgeryDuration = patient.surgeryWeight;
          patient.detailMedical = data[1].filter(item => patient.surgeryShiftCode === item.surgeryShiftCode);
          patient.proposedStartDateTime = '';
          patient.proposedEndDateTime = '';
          if (patient.expectedDate && patient.expectedTime) {
            patient.ProposedDateTimeShow = patient.expectedTime + ' ' + this.generateDatetimeShow(patient.expectedDate);
            patient.proposedStartDateTime = patient.expectedDate + ' ' + patient.expectedTime.split(' - ')[0] + '';
            patient.proposedEndDateTime = patient.expectedDate + ' ' + patient.expectedTime.split(' - ')[1] + '';   
          }
          return patient;
        }));
        localStorage.setItem('file', JSON.stringify(this.data));
        this.message.success('File parse successfully');
        this.state.load = false;
        return;
      }
    }
    this.state.load = false;
    this.message.error('File input is not valid');
  }

  generateDatetimeShow(datetimeString) {
    var arr = datetimeString.split('-');
    return [arr[2], arr[1], arr[0]].join('/');
  }

  reRenderIndex(array) {
    return array.map((item, index) => {
      item.index = index;
      return item;
    });
  }

  checkAll(value: boolean): void {
    this.data.forEach(item => this.mapOfCheckedId[item.index] = value);
    this.checkItem();
  }

  checkItem() {
    this.isAllCheck = this.data.every(item => this.mapOfCheckedId[item.index]);
  }

  getCheckedItem() {
    return this.data.filter(item => this.mapOfCheckedId[item.index] === true);
  }

  getUnCheckedItem() {
    return this.data.filter(item => !(this.mapOfCheckedId[item.index] === true));
  }

  clearResult() {
    if (this.file) {
      this.file.nativeElement.value = null;
    }
    this.isAllCheck = false;
    this.medicals = [];
    this.data = [];
    this.mapOfCheckedId = {};
    localStorage.setItem('file', JSON.stringify([]));
  }

  importList() {
    const profiles = GLOBAL.copyObject(this.getCheckedItem()).map(el => {
      // delete el.detailMedical;
      delete el.medicalRecord;
      delete el.doctorName;
      delete el.patientId;
      delete el.index;
      // delete el.priority;
      delete el.surgeryShiftId;
      delete el.surgeryCode;
      delete el.patientDob;
      delete el.expectedDate;
      delete el.expectedTime;
      delete el.ProposedDateTimeShow;
      return el;
    });
    // const medicals = GLOBAL.copyObject(this.medicals).map(medical => {
    //   return {
    //     medicalSupplyId: medical.code,
    //     surgeryShiftCode: medical.surgeryShiftCode,
    //     quantity: medical.quantity
    //   };
    // });
    if (profiles) {
      this.state.load = true;
      // const apiList = combineLatest(
      //   this.importSV.importShift(profiles),
      //   this.importSV.importShiftMedicalSupply(medicals)
      // );
      const data = {
        surgeryShifts: profiles
      }
      this.importSV.importShift(data).subscribe(el => {
        this.message.success('Import Successful');
        this.notificationService.getTmpNotification(this.layoutData.user.data.role).subscribe(re => {}); //notify
        this.state.load = false;
        if (this.isAllCheck) {
          this.clearResult();
        } else {
          this.data = this.reRenderIndex(this.getUnCheckedItem());
          localStorage.setItem('file', JSON.stringify(this.data));
          this.mapOfCheckedId = {};
        }
      }, er => {
        this.message.error('Import Fail!!! Please try again');
        console.log(er.message);
        this.state.load = false;
      });
    } else {
      this.message.error('Data is not valid');
    }
  }
}
