import {Injectable} from '@angular/core';
import {AuthService} from './auth.service';
import {ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot} from '@angular/router';
import {User, UserService} from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate, CanActivateChild {
  userData: any;

  constructor(private auth: AuthService, private user: UserService, private router: Router) {
    this.user.getUser.subscribe((data: User) => this.userData = data);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.checkValid(route);
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.checkValid(childRoute);
  }

  checkValid(route) {
    if (!this.auth.getStatus) {
      this.auth.logout();
      return false;
    }
    const data = route.data;
    console.log(data && data.roles && data.roles.length > 0 && this.userData);
    if (data && data.roles && data.roles.length > 0 && this.userData) {
      if (data.roles.indexOf(this.userData.role) === -1) {
        this.router.navigate(['pages']);
        return false;
      }
    }
    return true;
  }
}
