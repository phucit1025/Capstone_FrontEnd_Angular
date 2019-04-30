import {Injectable} from '@angular/core';
import {JwtHelper} from 'angular2-jwt';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {catchError, map} from 'rxjs/operators';
import {Observable, of as observableOf} from 'rxjs';
import {GLOBAL} from '../global';
import {UserService} from './user.service';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private isLoggedIn = false;
  private name = 'EBVM';
  private jwt: JwtHelper;

  constructor(private http: HttpClient, private router: Router, private user: UserService) {
    this.jwt = new JwtHelper();
    this.isLoggedIn = this.checkToken(this.getToken());
  }

  get getStatus() {
    return this.isLoggedIn;
  }

  set setStatus(value: boolean) {
    this.isLoggedIn = value;
  }

  getToken() {
    return localStorage.getItem(this.name);
  }

  setToken(token) {
    token ? localStorage.setItem(this.name, token) : localStorage.removeItem(this.name);
  }

  private checkToken(token): boolean {
    if (token) {
      try {
        const tokenData = this.decodeToken(token);
        if (tokenData) {
          console.log(tokenData);
          var idNumber = parseInt(tokenData.UserInfoId);
          this.user.setUser = {
            id: idNumber,
            username: tokenData.email,
            name: tokenData.email,
            role: tokenData['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
          };
        }
        return !!tokenData;
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  public decodeToken(token) {
    return this.jwt.decodeToken(token);
  }

  public login(data: { username: string, password: string }): Observable<any> {
    return this.http.post(GLOBAL.API + 'Account/Login', data).pipe(
      map((token: any) => {
        if (this.checkToken(token.token)) {
          this.setStatus = true;
          this.setToken(token.token);
          return {
            role: token.role,
            success: true
          };
        }
        return {
          error: 'Invalid token'
        };
      }, catchError((res) => {
        return observableOf({
          error: res
        });
      }))
    );
  }

  logout() {
    this.setStatus = false;
    this.setToken(null);
    this.router.navigate(['/auth']);
  }
}
