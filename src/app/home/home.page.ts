import { Component, OnInit, signal, NgZone, ChangeDetectorRef } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { IonContent, ToastController, IonGrid, IonRow, IonCol, ModalController } from '@ionic/angular';
import { ShopComponent } from './shop/shop.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    DecimalPipe,
    IonContent,
    IonGrid, 
    IonRow, 
    IonCol
  ],
})
export class HomePage implements OnInit {

  contador: number = 0; 
  extra_clicks: number = 0; // Inicializado en 0 para que el 1er nivel sume 2 por clic correctamente

  nivelMasia: number = 0;
  nivelCampNou: number = 0;
  nivelLionel: number = 0; // Nivel de consejos de Lionel (0 a 9, representando niveles 1 al 10)

  floatingTexts: { id: number; value: string; top: number; left: number }[] = [];
  private nextId = 0;

  constructor(
    private toastController: ToastController, 
    private modalController: ModalController,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarDatosLocales();
    this.iniciarGeneracionAutomatica();
  }

  cargarDatosLocales() {
    this.contador = Number(localStorage.getItem('clicks')) || 0;
    this.extra_clicks = Number(localStorage.getItem('extra_clicks')) || 0;
    this.nivelMasia = Number(localStorage.getItem('nivelMasia')) || 0;
    this.nivelCampNou = Number(localStorage.getItem('nivelCampNou')) || 0;
    this.nivelLionel = Number(localStorage.getItem('nivelLionel')) || 0;
  }

  iniciarGeneracionAutomatica() {
    setInterval(() => {
      if (this.nivelMasia > 0) {
        const clicksPorSegundo = this.nivelMasia * 15;
        
        this.ngZone.run(() => {
          this.contador += clicksPorSegundo;
          this.updateLocalStorageClicks();
          this.cdr.detectChanges();
        });
      }
    }, 1000);
  }

  getMasiaImagen(): string {
    switch (this.nivelMasia) {
      case 1: return 'assets/img/masiaT1.png';
      case 2: return 'assets/img/masiaT2.png';
      case 3: return 'assets/img/masiaT3.png';
      default: return '';
    }
  }

  getCampNouImagen(): string {
    switch (this.nivelCampNou) {
      case 1: return 'assets/img/campnouT1.png';
      case 2: return 'assets/img/campnouT2.png';
      case 3: return 'assets/img/campnouT3.png';
      default: return '';
    }
  }

  async openShop() {
    const modal = await this.modalController.create({
      component: ShopComponent,
      cssClass: 'fcb-shop-modal',
      componentProps: {
        nivelMasia: this.nivelMasia,
        nivelCampNou: this.nivelCampNou,
        nivelLionel: this.nivelLionel
      }
    });
    await modal.present();

    const { data, role } = await modal.onDidDismiss();

    if (role === "buy" && data) {
      if (this.contador >= data.price) {
        this.restarClicks(data.price);

        // Procesar compra de Consejos de Lionel
        if (data.name.includes("Consejos de Lionel")) {
          this.nivelLionel++;
          this.extra_clicks = this.nivelLionel; // Nivel 1 = 1 extra (+2 total), Nivel 2 = 2 extra (+3 total)... hasta 9 extra (+10 total)
          localStorage.setItem("nivelLionel", String(this.nivelLionel));
          localStorage.setItem("extra_clicks", String(this.extra_clicks));
        }

        // Procesar compra de La Masía
        if (data.name.includes("La Masía")) {
          this.nivelMasia++;
          localStorage.setItem("nivelMasia", String(this.nivelMasia));
        }
        
        // Procesar compra del Camp Nou
        if (data.name.includes("Camp Nou")) {
          this.nivelCampNou++;
          localStorage.setItem("nivelCampNou", String(this.nivelCampNou));
        }

        this.cdr.detectChanges();
      }
    }
  }

  ContadorClicks(event: MouseEvent) {
    const ganancia = 1 + this.extra_clicks;
    
    this.ngZone.run(() => {
      this.contador += ganancia;
      this.updateLocalStorageClicks();
      
      this.crearTextoFlotante(event, `+${ganancia}`);
      this.cdr.detectChanges();
    });
  }

  crearTextoFlotante(event: MouseEvent, text: string) {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const id = this.nextId++;
    this.floatingTexts.push({ id, value: text, top: y, left: x });

    setTimeout(() => {
      this.floatingTexts = this.floatingTexts.filter(t => t.id !== id);
      this.cdr.detectChanges();
    }, 800);
  }

  restarClicks(num: number) {
    this.contador -= num;
    this.updateLocalStorageClicks();
  }

  updateLocalStorageClicks() {
    localStorage.setItem('clicks', String(this.contador));
  }
}