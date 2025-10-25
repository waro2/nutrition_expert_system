// src/app/core/services/form-config.service.ts
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormField } from '../models/ui.model';
import { Fact } from '../models/fact.model';

@Injectable({
    providedIn: 'root'
})
export class FormConfigService {

    constructor(private fb: FormBuilder) { }

    getFormFields(): FormField[] {
        return [
            {
                key: 'NSS',
                label: 'Nombre de séances de sensibilisation',
                type: 'number',
                min: 0,
                max: 20,
                required: true
            },
            {
                key: 'Peduca',
                label: 'Participation aux activités éducatives',
                type: 'toggle',
                required: true
            },
            {
                key: 'NI',
                label: 'Niveau d\'instruction',
                type: 'select',
                options: [
                    { value: 0, label: 'Aucun' },
                    { value: 1, label: 'Primaire incomplet' },
                    { value: 2, label: 'Primaire complet' },
                    { value: 3, label: 'Secondaire' },
                    { value: 4, label: 'Supérieur' }
                ],
                required: true
            },
            {
                key: 'NAM',
                label: 'Nombre d\'activités mensuelles',
                type: 'number',
                min: 0,
                max: 30,
                required: true
            },
            {
                key: 'AgeMere',
                label: 'Âge de la mère (années)',
                type: 'number',
                min: 15,
                max: 50,
                required: true
            },
            {
                key: 'AAMA',
                label: 'Alimentation adéquate minimale acceptable',
                type: 'toggle',
                required: true
            },
            {
                key: 'MAQA',
                label: 'Méthodes d\'amélioration qualité aliments',
                type: 'toggle',
                required: true
            },
            {
                key: 'SML',
                label: 'Surveillance malnutrition légère',
                type: 'toggle',
                required: true
            }
        ];
    }

    createDiagnosticForm(): FormGroup {
        const formControls: { [key: string]: any } = {};

        this.getFormFields().forEach(field => {
            const validators = [];

            if (field.required) {
                validators.push(Validators.required);
            }

            if (field.type === 'number' && field.min !== undefined) {
                validators.push(Validators.min(field.min));
            }

            if (field.type === 'number' && field.max !== undefined) {
                validators.push(Validators.max(field.max));
            }

            const defaultValue = field.type === 'toggle' ? 0 :
                field.type === 'number' ? 0 :
                    field.options ? field.options[0].value : '';

            formControls[field.key] = [defaultValue, validators];
        });

        return this.fb.group(formControls);
    }

    getActionTypeLabels(): { [key: string]: string } {
        return {
            'recommendation': 'Recommandation',
            'notification': 'Notification',
            'action': 'Action',
            'content': 'Contenu pédagogique',
            'reminder': 'Rappel',
            'tip': 'Conseil',
            'community': 'Activité communautaire',
            'monitor': 'Surveillance',
            'program': 'Programme intensif',
            'positive': 'Encouragement',
            'workshop': 'Atelier pratique',
            'training': 'Formation',
            'support': 'Support personnalisé',
            'urgent': 'Intervention urgente',
            'advanced': 'Formation avancée',
            'followup': 'Suivi rapproché'
        };
    }

    getActionTypeIcon(type: string): string {
        const icons: { [key: string]: string } = {
            'recommendation': 'lightbulb',
            'notification': 'notifications',
            'action': 'assignment',
            'content': 'school',
            'reminder': 'alarm',
            'tip': 'tips_and_updates',
            'community': 'groups',
            'monitor': 'visibility',
            'program': 'calendar_today',
            'positive': 'thumb_up',
            'workshop': 'build',
            'training': 'cast_for_education',
            'support': 'support',
            'urgent': 'warning',
            'advanced': 'upgrade',
            'followup': 'schedule'
        };
        return icons[type] || 'help';
    }

    getActionTypeColor(type: string): string {
        const colors: { [key: string]: string } = {
            'recommendation': 'primary',
            'notification': 'accent',
            'action': 'warn',
            'content': 'primary',
            'reminder': 'accent',
            'tip': 'primary',
            'community': 'accent',
            'monitor': 'warn',
            'program': 'warn',
            'positive': 'primary',
            'workshop': 'accent',
            'training': 'primary'
        };
        return colors[type] || 'basic';
    }

    getPriorityColor(priority: number): string {
        if (priority >= 90) return 'warn';
        if (priority >= 70) return 'accent';
        return 'primary';
    }

    getPriorityLabel(priority: number): string {
        if (priority >= 90) return 'Critique';
        if (priority >= 70) return 'Élevée';
        if (priority >= 50) return 'Moyenne';
        return 'Faible';
    }
}