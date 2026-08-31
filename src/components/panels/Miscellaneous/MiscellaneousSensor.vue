<template>
    <v-container class="px-0 py-2">
        <v-row>
            <v-col class="pb-3">
                <v-subheader class="_miscellaneous-sensor-subheader">
                    <v-icon small class="mr-2">{{ unitToSymbol(unit) }}</v-icon>
                    <span>{{ convertName(name) }}</span>
                    <v-spacer />
                    <span>{{ output }}</span>
                </v-subheader>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { convertName, unitToSymbol } from '@/plugins/helpers'
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import {} from '@mdi/js'

@Component()
export default class MiscellaneousSensor extends Mixins(BaseMixin) {
    convertName = convertName
    unitToSymbol = unitToSymbol

    @Prop({ type: String, required: true }) declare readonly name: string
    @Prop({ type: String, required: true }) declare readonly type: string
    @Prop({ type: Number, default: null }) declare readonly value: number | null
    @Prop({ type: String, default: '' }) declare readonly unit: string

    get output(): string {
        if (this.value === null || !Number.isFinite(this.value)) return '--'

        let value = this.value
        if (this.type === 'analog_input') {
            value = Math.sign(value) * Math.round((Math.abs(value) + Number.EPSILON) * 100) / 100
        }

        return this.unit ? `${value} ${this.unit}` : `${value}`
    }
}
</script>

<style scoped>
._miscellaneous-sensor-subheader {
    height: auto;
}
</style>
