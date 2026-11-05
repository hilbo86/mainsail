<template>
    <v-container v-if="status" class="pb-0">
        <v-alert dense text :type="status.blocked_reasons.length ? 'warning' : 'info'" class="mb-0">
            <strong>{{ $t('Panels.LaserToolStatus.Tool') }}: {{ status.detected_tool }}</strong>
            <div v-if="status.requested_tool">
                {{ $t('Panels.LaserToolStatus.JobTool') }}: {{ status.requested_tool }}
            </div>
            <div>
                {{ $t(status.power_granted ? 'Panels.LaserToolStatus.Armed' : 'Panels.LaserToolStatus.Disarmed') }}
            </div>
            <div v-if="status.calibrating">
                {{
                    $t(
                        status.calibration_valid
                            ? 'Panels.LaserToolStatus.Calibrating'
                            : 'Panels.LaserToolStatus.Invalid'
                    )
                }}
            </div>
            <div v-for="reason in status.blocked_reasons" :key="reason">{{ reason }}</div>
            <div v-if="status.profile_calibrated && status.geometry">
                {{ $t('Panels.LaserToolStatus.MachineRange') }}: X {{ status.geometry.x_min }}…{{
                    status.geometry.x_max
                }}, Y {{ status.geometry.y_min }}…{{ status.geometry.y_max }} mm
            </div>
            <div v-if="coolingActive">{{ $t('Panels.LaserToolStatus.CoolingActive') }}</div>
            <template v-if="status.ir_z_locked">
                <div>
                    {{ $t(status.z_at_top ? 'Panels.LaserToolStatus.ZHeld' : 'Panels.LaserToolStatus.ZRequired') }}
                </div>
                <v-btn small class="mt-2" :disabled="!!status.requested_tool" @click="doHomeZ">
                    {{ $t('Panels.LaserToolStatus.HomeZ') }}
                </v-btn>
            </template>
        </v-alert>
    </v-container>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import ControlMixin from '@/components/mixins/control'
import { coolingControls, LaserToolStatus as ToolStatus } from '@/utils/laserTool'

@Component
export default class LaserToolStatus extends Mixins(ControlMixin) {
    get status(): ToolStatus | undefined {
        return this.$store.state.printer.laser_tool_manager
    }

    get coolingActive(): boolean {
        return this.$store.getters['printer/getMiscellaneous'].some(
            (entry: { name: string; power: number }) => coolingControls.includes(entry.name) && entry.power > 0
        )
    }
}
</script>
