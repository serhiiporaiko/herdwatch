import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';
import { UserModel } from '../../models/user.interface';
import { UpdateMethod, UsersService } from '../../providers/users.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
})
export class UsersPage implements OnInit, OnDestroy {

  public UPDATE_METHOD = UpdateMethod;
  public destroy$ = new Subject<any>();
  public users: UserModel[];
  public isSaveButtonVisible = false;

  constructor(
    private alert: AlertController,
    private usersService: UsersService) { }

  ngOnInit() {
    const users$ = this.usersService.users$.pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged(),
      filter(users => !!users)
    );
    users$.subscribe(users => {
      const activeUsers = users.filter(u => u.updateMethod !== this.UPDATE_METHOD.DELETE);
      const archivedUsers = users.filter(u => u.updateMethod === this.UPDATE_METHOD.DELETE);
      this.users = [...activeUsers, ...archivedUsers];
      this.isSaveButtonVisible = !!(users.filter(u => u.updateMethod) && users.filter(u => u.updateMethod).length);
    });
  }

  save() {
    const users = this.users.filter(u => u.updateMethod);
    if (users && users.length) {
      this.usersService.syncList(users);
    }
  }

  async presentConfirm(event, user) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const alert = await this.alert.create({
      header: 'Delete user',
      message: 'Are you shure?',
      buttons: [{
        text: 'Cancel',
        role: 'cancel',
        handler: () => { }
      }, {
        text: 'Ok',
        handler: () => this.usersService.updateDb(user.id, null, this.UPDATE_METHOD.DELETE, true, false)
      }]
    });
    await alert.present();
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

}
