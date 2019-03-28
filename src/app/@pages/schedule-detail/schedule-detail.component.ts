import { GLOBAL } from './../../global';
import { NzMessageService } from 'ng-zorro-antd';
import { FormBuilder, FormControl, Validators, FormArray } from '@angular/forms';
import { Component, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ScheduleService } from '../../page-services/schedule.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { TreatmentComponent } from './treatment/treatment.component';

@Component({
  selector: 'app-schedule-detail',
  templateUrl: './schedule-detail.component.html',
  styleUrls: ['./schedule-detail.component.css'],
  preserveWhitespaces: false
})
export class ScheduleDetailComponent implements OnInit {
  @ViewChild(TreatmentComponent) treatment : TreatmentComponent;

  id: number;
  detailSchedule: any;
  data: any;
  mapOfExpandData: { [key: string]: boolean } = {};
  customeStyle = {
    'background': '#f7f7f7',
    'border-radius': '4px',
    'margin-bottom': '24px',
    'border': '0px'
  };
  selected = {
    selectedTime: null,
    selectedBed: null,
    selectedRoom: null
  };
  state = {
    load: true,
    loadGetSupply: false,
    loadEditSurgery: false,
    
    loadAllSupply: false,
    loadChangeStatus: false,
    loadAllDrug: false,
   
    loadAddSupply: false,
    loadSaveProcedure: false,
    editMode: false,
    showAddSupply: false,
    
    showStatusModal: false,
    loadHealthcare: false,
  
  };
  surgeryDetail = {
    surgeryProcedure: '',
    containData: '',
    supplyForm: null,
    supplyUsed: []
  };
  
  healthcareDetail = {
    healthcareReport: []
  };
  common = {
    supplies: [],
  };

  constructor(private message: NzMessageService, private schedule: ScheduleService,
    private router: Router, private route: ActivatedRoute, private fb: FormBuilder) {
    route.params.subscribe(params => {
      this.id = params.id;
      this.getDetail(params.id);
    });
  }

  ngOnInit() {
    // this.loadAllDrug();
    // this.loadAllSupply();
    this.treatment.loadAllNurse();
    this.createNewForm();
  }

  delete_mark_VI(str) {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
    str = str.replace(/đ/g, 'd');
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
    str = str.replace(/Đ/g, 'D');
    return str;
  }

nzFilterOption = () => true;

trackByFnSupply(index, item){
  return item ? item.id : undefined;
}

searchSupply(value: string): void {
  this.schedule.searchSupply(value)
    .subscribe(data => {
      console.log(data);
      this.common.supplies = data.map(item => ({
        medicalSupplyId: item.medicalSupplyId,
        medicalSupplyName: item.medicalSupplyName,
      }));
    }, er => console.log(er));
}

  createNewForm() {
    this.surgeryDetail.supplyForm = this.fb.group({
      listSupply: this.fb.array([this.createFormSupply()])
    });
  }

  getSupply(id) {
    this.state.loadGetSupply = true;
    this.schedule.getUsedSupply(id).subscribe((supply: any) => {
      this.surgeryDetail.supplyUsed = supply;
      this.state.loadGetSupply = false;
    }, er => {
      this.state.loadGetSupply = false;
    });
  }

  loadAllSupply() {
    this.state.loadAllSupply = true;
    this.schedule.getAllSupply().subscribe((supplies: any) => {
      this.common.supplies = supplies;
      this.state.loadAllSupply = false;
    }, er => this.state.loadAllSupply = false);
  }

  // loadAllDrug() {
  //   this.state.loadAllDrug = true;
  //   this.schedule.getAllDrug().subscribe((drugs: any) => {
  //     this.common.drugs = drugs;
  //     this.state.loadAllDrug = false;
  //   }, er => this.state.loadAllDrug = false);
  // }

  getEkipMember(id) {
    this.schedule.getEkipMember(id).subscribe(res => {
      this.data.ekipMember = res;
    }, er => { });
  }

  getDetail(id) {
    if (!this.state.load) {
      this.state.load = true;
    }
    this.schedule.getDetailSchedule(id).subscribe((res: any) => {
      this.detailSchedule = res;
      this.state.load = false;
      this.data = res;
      console.log(res);
      this.getSupply(res.id);
      this.getEkipMember(res.id);
      this.treatment.getTreatment(res.id);
      this.getHealthcare(res.id);
      this.treatment.getNurseByShiftId(res.id);
      this.surgeryDetail.surgeryProcedure = res.procedure;
      this.surgeryDetail.containData = res.procedure;
    }, er => {
      if (er.status !== 401 || er.status !== 403) {
        this.router.navigate(['pages/error']);
      }
    });
  }

  createFormSupply() {
    return this.fb.group({
      medicalSupplyId: new FormControl('', Validators.required),
      quantity: new FormControl(1, [Validators.required, Validators.min(1)])
    });
  }

  addFormSupply(): void {
    const array = this.surgeryDetail.supplyForm.get('listSupply') as FormArray;
    array.push(this.createFormSupply());
  }

  deleteFormSupply(index: number) {
    const array = this.surgeryDetail.supplyForm.get('listSupply') as FormArray;
    array.removeAt(index);
  } 

  submitAddSupplyForm() {
    if (this.surgeryDetail.supplyForm.valid && this.surgeryDetail.supplyForm.value.listSupply.length > 0) {
      this.state.loadAddSupply = true;
      const finalData = this.surgeryDetail.supplyForm.value.listSupply.map(item => {
        item.surgeryShiftId = this.data.id;
        return item;
      });

      this.schedule.addUsedMedicalSupply(finalData).subscribe(res => {
        this.state.loadAddSupply = false;
        this.state.showAddSupply = false;
        this.createNewForm();
        this.getSupply(this.data.id);
        this.message.success('Add Successful');
      }, er => {
        this.state.loadAddSupply = false;
        this.message.error('Add Fail!!!');
      });
    }
  }

  saveSurgeryProcedure() {
    this.state.loadSaveProcedure = true;
    this.schedule.saveSurgeryProcedure({
      procedure: this.surgeryDetail.surgeryProcedure,
      surgeryShiftId: this.data.id
    }).subscribe(res => {
      this.message.success('Save Successful');
      this.state.loadSaveProcedure = false;
      this.state.editMode = false;
      this.surgeryDetail.containData = GLOBAL.copyObject(this.surgeryDetail.surgeryProcedure);
    }, er => {
      this.message.error('Save Fail!!!');
      this.state.loadSaveProcedure = false;
      this.surgeryDetail.surgeryProcedure = GLOBAL.copyObject(this.surgeryDetail.containData);
    });
  }

  openStartShift() {
    switch (this.data.statusName) {
      case 'Preoperative':
        this.state.showStatusModal = true;
        this.selected.selectedTime = new Date(this.data.startTime);
        break;
      case 'Intraoperative':
        this.state.showStatusModal = true;
        this.selected.selectedTime = new Date(this.data.endTime);
        this.selected.selectedRoom = null;
        this.selected.selectedBed = null;
        break;
      case 'Postoperative': break;
    }
  }

  startShift() {
    switch (this.data.statusName) {
      case 'Preoperative':
        const Pdate = moment(this.data.startTime).format('YYYY-MM-DD');
        const Ptime = moment(this.selected.selectedTime).format('HH:mm');
        this.state.loadChangeStatus = true;
        this.schedule.setIntraoperativeStatus({
          shiftId: this.data.id,
          time: Pdate + ' ' + Ptime
        }).subscribe(sc => {
          this.message.success('Change Successful');
          this.state.showStatusModal = false;
          this.selected.selectedTime = null;
          this.state.loadChangeStatus = false;
          this.getDetail(this.id);
        }, er => {
          this.message.error('Change Fail');
          this.state.loadChangeStatus = false;
        })
        break;
      case 'Intraoperative':
        const date = moment(this.data.endTime).format('YYYY-MM-DD');
        const time = moment(this.selected.selectedTime).format('HH:mm');
        const bedPost = this.selected.selectedBed;
        const roomPost = this.selected.selectedRoom;
        const data = {
          actualEndDateTime: date + ' ' + time,
          shiftId: this.data.id
        } as any;
        if (bedPost) {
          data.bedPost = bedPost;
        }
        if (roomPost) {
          data.roomPost = roomPost;
        }
        this.state.loadChangeStatus = true;
        this.schedule.setPostoperativeStatus(GLOBAL.parseUrlString(data)).subscribe(sc => {
          this.message.success('Change Successful');
          this.state.showStatusModal = false;
          this.selected.selectedBed = null;
          this.selected.selectedRoom = null;
          this.selected.selectedTime = null;
          this.state.loadChangeStatus = false;
          this.getDetail(this.id);
        }, er => {
          this.message.error('Change Fail');
          this.state.loadChangeStatus = false;
        })
        break;
      case 'Postoperative': break;
    }

  }

  getHealthcare(id) {
    this.state.loadHealthcare = true;
    this.schedule.getHealthcareReport(id).subscribe((hc: any) => {
      this.healthcareDetail.healthcareReport = hc;
      this.state.loadHealthcare = false;
    }, er => this.state.loadHealthcare = false);
  }

  exportSurgery(){
    this.schedule.exportSurgery(this.data.id);
  }
}
