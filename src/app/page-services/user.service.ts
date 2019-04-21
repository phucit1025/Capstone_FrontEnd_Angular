import { HttpClient } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private user: BehaviorSubject<User>;

  constructor(private http: HttpClient) {
    this.user = new BehaviorSubject<User>(null);
  }

  set setUser(user: User) {
    this.user.next(user);
  }

  get getUser() {
    return this.user.asObservable();
  }
}

export interface User {
  id: number;
  username: string;
  name?: string;
  role: 'ChiefNurse' | 'HospitalStaff' | 'MedicalSupplier';
}
