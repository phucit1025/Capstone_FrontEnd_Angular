import {Component, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {AuthService} from '../../page-services/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component1.html',
  styleUrls: ['./login.component1.css']
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  state = {
    load: false,
    errorMessage: null
  };

  constructor(private fb: FormBuilder, private router: Router, private auth: AuthService) {
    const token = this.auth.getToken();
    if (token && this.auth.decodeToken(token)) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.form = this.fb.group({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
    });
  }

  submit() {
    this.state.errorMessage = null;
    if (this.form.valid) {
      this.state.load = true;
      this.auth.login(this.form.value).subscribe(res => {
        this.state.load = false;
        if (res.success) {
          let page = '';
          switch (res.role) {
            case 'MedicalSupplier':
              page = 'confirm-medical';
              break;
            case 'HospitalStaff':
              page = 'import-file';
              break;
            default:
              page = 'schedule';
          }
          this.router.navigate([`/pages/${page}`]);
        } else {
          this.state.errorMessage = 'Invalid token';
        }
      }, er => {
        this.state.errorMessage = 'Invalid username or password';
        this.state.load = false;
      });
    }
  }

}
