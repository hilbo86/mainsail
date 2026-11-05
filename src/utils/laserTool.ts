export interface LaserToolStatus {
    detected_tool: string
    requested_tool: string | null
    power_granted: boolean
    profile_calibrated: boolean
    blocked_reasons: string[]
    temperature_sensors: string[]
    valid_temperature_sensors: string[]
    available_controls: string[]
    ir_z_locked: boolean
    z_at_top: boolean
    calibrating: boolean
    calibration_valid: boolean
    applied_offset: number[]
    geometry: {
        x_min: number
        x_max: number
        y_min: number
        y_max: number
        offset_x: number
        offset_y: number
    } | null
}

export const toolTemperatureSensors = ['temperature_sensor Laser', 'temperature_sensor aux_tool']
export const toolControls = [
    'laser',
    'aux_tool',
    'tool_enable',
    'air_assist',
    'Steckdose_4',
    'water_pump',
    'heat_exchanger',
    'tank_licht',
    'uv_disinfector',
    'crosshair',
    'Y_Laser',
]
export const coolingControls = ['water_pump', 'heat_exchanger', 'tank_licht', 'uv_disinfector']
export const auxHistoryNames = ['IR_LASER (aux_tool)', 'DREMEL (aux_tool)']

export function toolSensorVisible(status: LaserToolStatus | undefined, name: string): boolean {
    return !status || !toolTemperatureSensors.includes(name) || status.temperature_sensors.includes(name)
}

export function toolSensorValid(status: LaserToolStatus | undefined, name: string): boolean {
    return !status || !toolTemperatureSensors.includes(name) || status.valid_temperature_sensors.includes(name)
}

export function toolControlVisible(status: LaserToolStatus | undefined, name: string, power: number): boolean {
    return (
        !status ||
        !toolControls.includes(name) ||
        status.available_controls.includes(name) ||
        (coolingControls.includes(name) && power > 0)
    )
}

export function toolWorkBounds(
    status: LaserToolStatus | undefined,
    machine: number[],
    gcode: number[],
    maximum: boolean
): number[] | null {
    const p = status?.geometry
    if (!status?.profile_calibrated || !p) return null

    // Keep the workpiece origin and fixed tool correction separate.
    const baseX = (machine[0] ?? 0) - (gcode[0] ?? 0) - (status.applied_offset[0] ?? 0) - p.offset_x
    const baseY = (machine[1] ?? 0) - (gcode[1] ?? 0) - (status.applied_offset[1] ?? 0) - p.offset_y
    return [(maximum ? p.x_max : p.x_min) - baseX, (maximum ? p.y_max : p.y_min) - baseY]
}
