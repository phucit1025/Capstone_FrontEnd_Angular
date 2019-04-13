import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GLOBAL} from '../global';

@Injectable({
  providedIn: 'root'
})
export class SpecialtyService {
  private name = 'Specialties';

  constructor(private http: HttpClient) {
  }

  getSpecialtyGroups() {
    return this.http.get(GLOBAL.API + this.name + '/GetSpecialtyGroups');
  }

  getSpecialties() {
    return this.http.get(GLOBAL.API + this.name + '/GetSpecialties');
  }

  setSpecialtyToGroup(group: any) {
    return this.http.post(GLOBAL.API + this.name + '/SetSpecialtyToGroup', group);
  }

  createSpecialtyGroup(model: any) {
    return this.http.post(GLOBAL.API + this.name + '/CreateSpecialtyGroup', model);
  }

  createSpecialty(model: any) {
    return this.http.post(GLOBAL.API + this.name + '/CreateSpecialty', model);
  }

  getRooms() {
    return this.http.get(GLOBAL.API + 'Specialties/GetRooms');
  }

  setRoomToGroup(data) {
    return this.http.post(GLOBAL.API + 'Specialties/SetSpecialtyGroupToRoom', data);
  }
}
