import {Component, OnInit} from '@angular/core';
import {ScheduleService} from '../../page-services/schedule.service';
import {SpecialtyService} from '../../page-services/specialty.service';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {NzMessageService} from 'ng-zorro-antd';

@Component({
  selector: 'app-room-specialty-group',
  templateUrl: './room-specialty-group.component.html',
  styleUrls: ['./room-specialty-group.component.css']
})
export class RoomSpecialtyGroupComponent implements OnInit {
  state = {
    data: [],
    load: false,
    visible: false,
    stateId: null,
  };

  group = {
    data: [],
    loadSelect: false,
    form: null as FormGroup,
    loadForm: false,
  };

  constructor(private specialtySV: SpecialtyService, private fb: FormBuilder, private messageSV: NzMessageService) {
  }

  ngOnInit() {
    this.loadRoom();
    this.loadGroup();
  }

  loadRoom() {
    this.state.load = true;
    this.specialtySV.getRooms()
      .subscribe((res: any) => {
          this.state.load = false;
          this.state.data = res;
        }
      );
  }

  loadGroup() {
    this.group.loadSelect = true;
    this.specialtySV.getSpecialtyGroups()
      .subscribe((res: any) => {
          this.group.loadSelect = false;
          this.group.data = res;
        }
      );
  }

  createForm(idRoom, idGroup) {
    const id = [new FormControl(idGroup, Validators.required)];
    this.group.form = this.fb.group({
      surgeryRoomId: new FormArray(id, Validators.required),
      specialtyGroupId: new FormControl(idGroup, Validators.required),
    });
  }

  submit() {
    this.group.loadForm = true;
    this.specialtySV.setRoomToGroup(this.group.form.value).subscribe(sc => {
      this.messageSV.success('Change Group Successful');
      this.group.loadForm = false;
    }, er => {
      this.group.loadForm = false;
      this.messageSV.error('Change Group Fail!!!');
    });
  }

}
