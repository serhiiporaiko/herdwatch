import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class ToastService {

  touchStart: number;
  disconnectedToast: HTMLIonToastElement;
  isShowed: boolean;

  constructor(private toast: ToastController) { }

  async createToast(message: string, className: string, duration?: number) {
    const toast = await this.toast.create({
      message: message,
      position: 'top',
      cssClass: className,
      duration: duration || null
    });
    await toast.present();
    this.handleToastSwipe(toast);
    return toast;
  }

  async showSuccessToast(message?: string) {
    this.createToast(message || 'Success', 'success_toast', 5000);
  }

  async showInfoToast(message?: string) {
    return this.createToast(message || 'Info', 'info_toast', 7000);
  }

  async showErrorToast(message?: string) {
    this.createToast(message || 'Something went wrong!', 'error_toast', 5000);
  }

  handleToastSwipe(toast: HTMLIonToastElement) {
    const id = toast.id;
    const element = document.getElementById(id);
    const startHandler = (e: TouchEvent) => this.touchStart = e.touches[0].clientY;
    const moveHandler = (e: TouchEvent) => {
      element.removeEventListener('touchstart', startHandler);
      element.removeEventListener('touchmove', moveHandler);
      setTimeout(() => {
        if (toast && document.getElementById(id) && (this.touchStart - e.touches[0].clientY > 0)) {
          toast.dismiss();
        };
      }, 50);
    };
    element.addEventListener('touchstart', startHandler);
    element.addEventListener('touchmove', moveHandler);
  }

  dismissDisconnected() {
    if (this.isShowed && this.disconnectedToast) {
      this.disconnectedToast.dismiss();
    }
    this.isShowed = false;
  }
}
