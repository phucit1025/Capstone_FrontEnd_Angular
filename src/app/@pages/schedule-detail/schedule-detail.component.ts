import {GLOBAL} from './../../global';
import {NzMessageService, NzModalService} from 'ng-zorro-antd';
import {FormBuilder, FormControl, Validators, FormArray} from '@angular/forms';
import {Component, OnInit, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import {ScheduleService} from '../../page-services/schedule.service';
import {ScheduleDetailService} from '../../page-services/schedule-detail.service';
import {ActivatedRoute, Router} from '@angular/router';
import * as moment from 'moment';
import {TreatmentComponent} from './treatment/treatment.component';

@Component({
  selector: 'app-schedule-detail',
  templateUrl: './schedule-detail.component.html',
  styleUrls: ['./schedule-detail.component.css'],
  preserveWhitespaces: false
})
export class ScheduleDetailComponent implements OnInit {
  @ViewChild(TreatmentComponent) treatment: TreatmentComponent;

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
    selectedRoom: null,
    statusId: null,
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

    showSurgeryProfile: false
  };
  surgeryDetail = {
    surgeryProcedure: '',
    containData: '',
    supplyForm: null,
    supplyUsed: []
  };

  surgeons = {
    data: [],
    list: [],
    load: false,
    loadList: false,
  };

  healthcareDetail = {
    healthcareReport: []
  };
  common = {
    supplies: [],
  };
  messageInfo: any;
  currentStatus: any;

  surgeryProfileEditForm: any;
  searchedCatalogs: any;
  messageCheckPatient: any;
  patientInfo: any;

  constructor(private message: NzMessageService, private schedule: ScheduleService,
              private router: Router, private route: ActivatedRoute,
              private fb: FormBuilder, private modalService: NzModalService,
              private schedule_detail: ScheduleDetailService) {
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
    this.createSurgeryProfileEditForm();
    this.loadSurgeon();
    this.loadListSurgeon();
    // this.loadSurgeryProfile();


  }

  loadListSurgeon() {
    this.surgeons.loadList = true;
    this.schedule.getSurgeonList(this.id).subscribe((list: any) => {
      this.surgeons.list = list;
      this.surgeons.loadList = false;
    });
    this.getEkipMember(this.id);
  }


  loadSurgeon() {
    this.surgeons.load = true;
    this.schedule.getAvailableSurgeons(this.id).subscribe((sugs: any) => {
      this.surgeons.data = sugs;
      this.surgeons.load = false;
    });
  }

  nzFilterOption = () => true;

  trackByFnSupply(index, item) {
    return item ? item.medicalSupplyId : undefined;
  }

  searchSupply(value: string): void {
    value.trim();
    if (value !== '') {
      this.schedule.searchSupply(value)
        .subscribe(data => {
          console.log(data);
          this.common.supplies = data.map(item => ({
            medicalSupplyId: item.medicalSupplyId,
            medicalSupplyName: item.medicalSupplyName,
          }));
        }, er => console.log(er));
    }
  }

  createNewForm() {
    this.surgeryDetail.supplyForm = this.fb.group({
      listSupply: this.fb.array([]),
      deleteMedicalSupplyIds: this.fb.array([]),
    });
    this.patchFormSupplyArray(this.surgeryDetail.supplyUsed);
  }

  patchFormSupplyArray(supply) {
    this.common.supplies = supply;
    const ctrl = this.surgeryDetail.supplyForm.controls.listSupply;
    if (supply.length === 0) {
      ctrl.push(this.fb.group({
        id: new FormControl(0, Validators.required),
        medicalSupplyId: new FormControl(null, Validators.required),
        quantity: new FormControl(1, [Validators.required, Validators.min(1)])
      }));
    }
    supply.map(x => {
      ctrl.push(this.fb.group({
        id: new FormControl(x.id, Validators.required),
        medicalSupplyId: new FormControl(x.medicalSupplyId, Validators.required),
        quantity: new FormControl(x.quantity, [Validators.required, Validators.min(1)])
      }));
    });
  }

  pushDeleteSupplyId(id) {
    console.log(id);
    const ctrl = this.surgeryDetail.supplyForm.controls.deleteMedicalSupplyIds;
    ctrl.push(new FormControl(id));
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
    }, er => {
    });
  }

  getDetail(id) {
    if (!this.state.load) {
      this.state.load = true;
    }
    this.schedule.getDetailSchedule(id).subscribe((res: any) => {
      this.detailSchedule = res;
      this.state.load = false;
      this.data = res;
      switch (this.data.statusName) {
        case 'Preoperative':
          this.messageInfo = 'This patient is preparing for surgery';
          this.currentStatus = 0;
          break;
        case 'Intraoperative':
          this.messageInfo = 'This patient is undergoing surgery';
          this.currentStatus = 1;
          break;
        case 'Postoperative':
          this.messageInfo = 'This patient is taking recovery to consciousness';
          this.currentStatus = 2;
          break;
        case 'Recovery':
          this.messageInfo = 'This patient is taking recovery';
          this.currentStatus = 3;
          break;

        default:
          this.messageInfo = 'This surgey shift is finished';
          this.currentStatus = 4;
          break;
      }
      console.log(this.messageInfo);
      console.log(res);
      switch (this.data.statusName) {
        case 'Preoperative':
          this.messageInfo = 'This patient is preparing for surgery';
          this.currentStatus = 0;
          break;
        case 'Intraoperative':
          this.messageInfo = 'This patient is undergoing surgery';
          this.currentStatus = 1;
          break;
        case 'Postoperative':
          this.messageInfo = 'This patient is taking recovery to consciousness';
          this.currentStatus = 2;
          break;
        case 'Recovery':
          this.messageInfo = 'This patient is taking recovery';
          this.currentStatus = 3;
          break;

        default:
          this.messageInfo = 'This surgey shift is finished';
          this.currentStatus = 4;
          break;
      }
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

      const data = {
        shiftMedicals: finalData,
        deleteMedicalSupplyIds: this.surgeryDetail.supplyForm.value.deleteMedicalSupplyIds
      };

      this.schedule.addUsedMedicalSupply(data).subscribe(res => {
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
        this.selected.statusId = '3';
        break;
      case 'Postoperative':
        this.state.showStatusModal = true;
        this.selected.selectedRoom = null;
        this.selected.selectedBed = null;
        this.selected.statusId = '4';
        break;
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
        });
        break;
      case 'Intraoperative':
        const date = moment(this.data.endTime).format('YYYY-MM-DD');
        const time = moment(this.selected.selectedTime).format('HH:mm');
        const data = {
          actualEndDateTime: date + ' ' + time,
          shiftId: this.data.id
        } as any;
        data.statusId = this.selected.statusId;
        console.log(GLOBAL.parseUrlString(data));
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
        });
        break;
      case 'Postoperative':
        const bedPost = this.selected.selectedBed;
        const roomPost = this.selected.selectedRoom;
        const data1 = {
          shiftId: this.data.id
        } as any;
        if (bedPost) {
          data1.bedPost = bedPost;
        }
        if (roomPost) {
          data1.roomPost = roomPost;
        }
        data1.statusId = this.selected.statusId;
        console.log(GLOBAL.parseUrlString(data1));
        this.state.loadChangeStatus = true;
        this.schedule.setPostoperativeStatus(GLOBAL.parseUrlString(data1)).subscribe(sc => {
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
        });
        break;
    }

  }

  getHealthcare(id) {
    this.state.loadHealthcare = true;
    this.schedule.getHealthcareReport(id).subscribe((hc: any) => {
      this.healthcareDetail.healthcareReport = hc;
      this.state.loadHealthcare = false;
    }, er => this.state.loadHealthcare = false);
  }

  exportSurgery(type) {
    this.schedule.exportSurgery(this.data.id, type);
  }

  showConfirm(): void {
    const data = {
      shiftId: this.data.id,
    };
    this.modalService.confirm({
      nzTitle: '<i>Do you want to finish this surgery shift?</i>',
      nzContent: '<b>This surgery shift will be finished.</b>',
      nzOnOk: () => this.schedule.setFinishedStatus(GLOBAL.parseUrlString(data)).subscribe(sc => {
        this.message.success('Finish Successful');
        this.getDetail(this.id);
      }, er => {
        this.message.error('Finish Fail');
      }),
    });
  }

  // Emergency update
  openSurgeryProfileModal() {
    this.state.showSurgeryProfile = true;
    this.createSurgeryProfileEditForm();
    this.loadSurgeryProfile();

  }

  closeSurgeryProfileModal() {
    this.state.showSurgeryProfile = false;
    this.messageCheckPatient = '';
    this.createSurgeryProfileEditForm();
  }

  createSurgeryProfileEditForm() {
    this.surgeryProfileEditForm = this.fb.group({
      shiftId: new FormControl(this.id),
      editIdentityNumber: new FormControl(),
      editPatientName: new FormControl(),
      editGender: new FormControl('0'),
      editYob: new FormControl(),
      editSurgeryId: new FormControl()
    });
  }

  loadSurgeryProfile() {
    this.searchedCatalogs = [];
    this.schedule_detail.loadEditSurgeryProfile(this.id).subscribe((res: any) => {
      console.log(res);
      if (res.editIdentityNumber != null) {
        this.searchedCatalogs.push({
          id: res.editSurgeryId,
          showName: res.surgeryCode + ' - ' + res.surgeryName
        });
        this.surgeryProfileEditForm = this.fb.group({
          shiftId: new FormControl(this.id),
          editIdentityNumber: new FormControl(res.editIdentityNumber),
          editPatientName: new FormControl(res.editPatientName),
          editGender: new FormControl(res.editGender.toString()),
          editYob: new FormControl(res.editYob),
          editSurgeryId: new FormControl(res.editSurgeryId)
        });
      }
    });
  }

  updateSurgeryProfile() {
    if (this.surgeryProfileEditForm) {
      const data = this.surgeryProfileEditForm.value;
      this.schedule_detail.updateSurgeryProfile(data).subscribe(res => {
        this.message.success('Create Successful!!!');
        // this.state.create = false;
        this.closeSurgeryProfileModal();
        this.createSurgeryProfileEditForm();
        this.getDetail(this.id);
      }, er => {
        // this.state.create = false;
        this.message.error('Create Fail!!!');
      });
    }
  }

  // search catalog
  searchSurgeryCatalog(searchName: string): void {
    searchName.trim();
    if (searchName !== '') {
      this.schedule_detail.searchSurgeryCatalog(searchName)
        .subscribe((data: any) => {
          // console.log(data);
          this.searchedCatalogs = data.map(item => ({
            id: item.id,
            showName: item.code + ' - ' + item.name
          }));
          // this.searchedCatalogs = [...this.searchedCatalogs];
          console.log(this.searchedCatalogs);
        }, er => console.log(er));
    }
  }

  checkExistedPatient() {
    const id = this.surgeryProfileEditForm.value.editIdentityNumber;
    console.log(this.surgeryProfileEditForm.controls);
    this.schedule_detail.checkExistedPatient(id).subscribe((res: any) => {
      if (res.name !== null) {
        this.messageCheckPatient = '';
        this.surgeryProfileEditForm.controls.editPatientName.setValue(res.name);
        this.surgeryProfileEditForm.controls.editGender.setValue(res.gender.toString());
        this.surgeryProfileEditForm.controls.editYob.setValue(res.yob);
      } else {
        this.messageCheckPatient = 'This patient isn\'t existed! Let create new patient';
        this.surgeryProfileEditForm.controls.editPatientName.setValue();
        this.surgeryProfileEditForm.controls.editGender.setValue('0');
        this.surgeryProfileEditForm.controls.editYob.setValue();
      }
      console.log(res);
    });
  }
}
