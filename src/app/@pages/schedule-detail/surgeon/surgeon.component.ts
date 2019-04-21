import {ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validator, Validators} from '@angular/forms';
import {ScheduleService} from '../../../page-services/schedule.service';
import {NzMessageService, NzModalService} from 'ng-zorro-antd';

@Component({
  selector: 'app-surgeon',
  templateUrl: './surgeon.component.html',
  styleUrls: ['./surgeon.component.css']
})
export class SurgeonComponent implements OnInit {
  @Input() data: any;
  @Output() dataChange = new EventEmitter();

  @Input() surgeons: any;
  @Output() surgeonsChange = new EventEmitter();

  surgeonsTemp = [];
  state = {
    showChangeSurgeons: false,
    showListSurgeons: false,
    loadSurgeons: false
  };

  form: FormGroup;

  constructor(private schedule: ScheduleService, private modalService: NzModalService,
              private fb: FormBuilder, private message: NzMessageService) {
  }

  ngOnInit() {
  }

  createNewForm(id) {
    this.surgeonsTemp = [];
    this.surgeons.data.forEach(sg => {
      const index = this.surgeons.list.map(el => el.id).indexOf(sg.id);
      if (index === -1) {
        this.surgeonsTemp.push(sg);
      }
    });
    this.form = this.fb.group({
      surgeryShiftId: new FormControl(id),
      surgeonId: new FormControl(null, Validators.required)
    });
  }

  createConfirm(id) {
    this.modalService.confirm({
      nzTitle: '<i>Are you sure that you want to delete this surgeon?</i>',
      nzOnOk: () => {
        this.surgeons.loadList = true;
        this.schedule.deleteSurgeon({
          surgeryShiftId: this.data.id,
          surgeonId: id
        }).subscribe(res => {
          this.message.success('Delete Successful');
          this.surgeonsChange.emit();
        }, er => {
          this.message.error('Delete Fail');
          this.surgeons.loadList = false;
        });
      }
    });
  }

  submit() {
    this.state.loadSurgeons = true;
    this.schedule.addSurgeons(this.form.value).subscribe(sc => {
      this.state.loadSurgeons = false;
      this.state.showChangeSurgeons = false;
      this.createNewForm(this.data.id);
      this.message.success('Add success surgeon');
      this.surgeonsChange.emit();
    }, er => {
      this.message.error('Add fail');
    });
  }

}
