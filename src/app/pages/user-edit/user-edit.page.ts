import { Component, QueryList, ViewChildren } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonRouterOutlet, NavController } from '@ionic/angular';
import { EMAIL_REGEX, NAME_REGEX } from '../../constants/regex.constants';
import { UserModel } from '../../models/user.interface';
import { ToastService } from '../../providers/toast.service';
import { UpdateMethod, UsersService } from '../../providers/users.service';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.page.html',
  styleUrls: ['./user-edit.page.scss'],
})
export class UserEditPage {

  public currentDate: Date;
  public email: AbstractControl;
  public firstName: AbstractControl;
  public isFormChanged = false;
  public lastName: AbstractControl;
  public selectedDate: string;
  public user: UserModel;
  public userForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private nav: NavController,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService,
    private usersService: UsersService) {

    this.currentDate = new Date(Date.now());

    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras && this.router.getCurrentNavigation().extras.state) {
        this.user = this.router.getCurrentNavigation().extras.state.user;
      }
      this.initContactForm(this.user);
    });
  }

  initContactForm(user?: UserModel) {
    this.userForm = this.fb.group({
      'firstName': [user && user.firstName
        ? user.firstName
        : '', [
        Validators.required,
        Validators.pattern(NAME_REGEX)
      ]],
      'lastName': [user && user.lastName
        ? user.lastName
        : '', [
        Validators.required,
        Validators.pattern(NAME_REGEX)
      ]],
      'email': [user && user.email
        ? user.email
        : '', [
        Validators.required,
        Validators.pattern(EMAIL_REGEX),
      ]],
    });

    this.firstName = this.userForm.controls['firstName'];
    this.lastName = this.userForm.controls['lastName'];
    this.email = this.userForm.controls['email'];

    this.selectedDate = this.user && this.user.dateOfBirth
      ? this.user.dateOfBirth
      : '1990-01-01';

    this.userForm.valueChanges.subscribe(() => this.checkChanges());
  }

  save() {
    const data = this.getNewData();
    if (data && Object.entries(data).length !== 0) {
      let promise = this.user
        ? this.usersService.updateDb(this.user.id, data, UpdateMethod.UPDATE, true, false)
        // @ts-ignore
        : this.usersService.setDb(data);
      promise.then(() => this.nav.pop());
    } else if (!data && this.user) {
      this.toast.showInfoToast('Nothing to save');
    }
  }

  getNewData() {
    let data = {};
    if (this.userForm.valid) {
      if (!this.user) {
        data = this.userForm.value;
        // @ts-ignore
        data.dateOfBirth = this.selectedDate.slice(0, 10);
      } else {
        for (let key in this.userForm.controls) {
          if (this.user[key] !== this.userForm.controls[key].value) {
            data[key] = this.userForm.controls[key].value;
          }
        }
        if (this.user.dateOfBirth !== this.selectedDate.slice(0, 10)) {
          // @ts-ignore
          data.dateOfBirth = this.selectedDate.slice(0, 10);
        }
      }
    }
    return data;
  }

  checkChanges() {
    const data = this.getNewData();
    this.isFormChanged = !!(data && Object.entries(data).length !== 0);
  }

}
