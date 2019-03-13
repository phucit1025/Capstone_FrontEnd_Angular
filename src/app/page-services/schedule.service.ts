import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GLOBAL} from '../global';

@Injectable({
  providedIn: 'root'
})

export class ScheduleService {
  private name = 'Schedule';

  constructor(private http: HttpClient) {
  }

  getSurgery() {
    return this.http.get(GLOBAL.API + this.name + '/GetSurgeryRooms');
  }

  getSurgeryByRoomAndDate(roomId, dayNumber) {
    return this.http.get(GLOBAL.API + this.name + '/GetSurgeryShiftsByRoomAndDate',
      {
        params: {roomId: roomId, dayNumber: dayNumber}
      });
  }

  getGetAvailableRoom(data: {
    startDate, endDate
  }) {
    return this.http.post(GLOBAL.API + this.name + '/GetAvailableRoom', data);
  }

  getRoomInfo(id) {
    return this.http.get(GLOBAL.API + this.name + '/GetRoomInfo?id=' + id);
  }

  getAvailableRoomForDuration(data: {
    hour, minute
  }) {
    return this.http.post(GLOBAL.API + this.name + '/GetAvailableRoomForDuration', {
      params: {
        hour: data.hour,
        minute: data.minute
      }
    });
  }

  changeSchedule(data) {
    return this.http.post(GLOBAL.API + this.name + '/ChangeSchedule', data);
  }

  changeScheduleForDuration(data) {
    return this.http.post(GLOBAL.API + this.name + '/ChangeScheduleForDuration', data);
  }

  swapShift(data) {
    return this.http.post(GLOBAL.API + this.name + '/SwapShifts', data);
  }

}
