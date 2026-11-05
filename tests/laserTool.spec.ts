import { describe, expect, it, vi } from 'vitest'
import { actions } from '@/store/printer/tempHistory/actions'
import { PrinterTempHistoryStateSerie, PrinterTempHistoryStateSourceEntry } from '@/store/printer/tempHistory/types'
import {
    LaserToolStatus,
    toolControlVisible,
    toolSensorValid,
    toolSensorVisible,
    toolWorkBounds,
} from '@/utils/laserTool'

const ir: LaserToolStatus = {
    detected_tool: 'IR_LASER',
    requested_tool: null,
    power_granted: false,
    profile_calibrated: true,
    blocked_reasons: [],
    temperature_sensors: ['temperature_sensor aux_tool'],
    valid_temperature_sensors: ['temperature_sensor aux_tool'],
    available_controls: ['aux_tool', 'crosshair', 'Y_Laser'],
    ir_z_locked: true,
    z_at_top: true,
    calibrating: false,
    calibration_valid: false,
    applied_offset: [0, 0],
    geometry: { x_min: 0, x_max: 250, y_min: 0, y_max: 240, offset_x: 3, offset_y: -7 },
}

describe('laser tool status presentation', () => {
    it('uses only backend attribution and preserves ordinary printer behavior', () => {
        expect(toolSensorVisible(ir, 'temperature_sensor Laser')).toBe(false)
        expect(toolSensorVisible(ir, 'temperature_sensor aux_tool')).toBe(true)
        expect(toolSensorVisible(undefined, 'temperature_sensor Laser')).toBe(true)
        expect(toolSensorVisible(ir, 'temperature_sensor Pumpe')).toBe(true)
        expect(toolSensorValid({ ...ir, valid_temperature_sensors: [] }, 'temperature_sensor aux_tool')).toBe(false)
    })

    it('shows required controls and a running main cooling circuit after a tool change', () => {
        expect(toolControlVisible(ir, 'aux_tool', 0)).toBe(true)
        expect(toolControlVisible(ir, 'laser', 0)).toBe(false)
        expect(toolControlVisible(ir, 'Steckdose_4', 0)).toBe(false)
        expect(toolControlVisible(ir, 'water_pump', 0)).toBe(false)
        expect(toolControlVisible(ir, 'water_pump', 1)).toBe(true)
        expect(toolControlVisible(undefined, 'laser', 0)).toBe(true)
    })

    it('keeps geometric correction and workpiece zero separate without applying an offset twice', () => {
        expect(toolWorkBounds(ir, [10, 20], [10, 20], true)).toEqual([253, 233])
        const applied = { ...ir, applied_offset: [-3, 7] }
        expect(toolWorkBounds(applied, [7, 27], [10, 20], true)).toEqual([253, 233])
        expect(toolWorkBounds(ir, [30, 40], [10, 20], false)).toEqual([-17, -27])
        expect(toolWorkBounds({ ...ir, profile_calibrated: false }, [], [], true)).toBeNull()
    })

    it('builds distinct Aux history series and rejects unattributed physical history on reconnect', () => {
        vi.useFakeTimers()
        vi.stubGlobal('window', { console: { debug: vi.fn() } })
        try {
            const commit = vi.fn()
            const init = actions.init as (context: object, payload: object) => void
            init(
                {
                    commit,
                    dispatch: vi.fn(),
                    rootState: { printer: { laser_tool_manager: ir } },
                    rootGetters: {
                        'printer/getAvailableSensors': ['temperature_sensor aux_tool', 'temperature_sensor Laser'],
                        'printer/tempHistory/getTemperatureStoreSize': 2,
                        'gui/getDatasetValue': () => null,
                    },
                },
                {
                    'temperature_sensor aux_tool': { temperatures: [40, 41] },
                    'temperature_sensor Laser': { temperatures: [25, 26] },
                }
            )
            const series = commit.mock.calls.find(([name]) => name === 'setInitSeries')?.[1] as
                PrinterTempHistoryStateSerie[] | undefined
            expect(series?.map((entry) => entry.name)).toEqual([
                'DREMEL (aux_tool)-temperature',
                'IR_LASER (aux_tool)-temperature',
                'temperature_sensor Laser-temperature',
            ])
            const source = commit.mock.calls.find(([name]) => name === 'setInitSource')?.[1] as
                PrinterTempHistoryStateSourceEntry[] | undefined
            expect(source?.[0]['IR_LASER (aux_tool)-temperature']).toBeNull()
            expect(source?.[0]['temperature_sensor Laser-temperature']).toBeNull()
        } finally {
            vi.useRealTimers()
            vi.unstubAllGlobals()
        }
    })

    it('records each active Aux sample under its backend tool attribution', async () => {
        const update = actions.updateSource as (context: object) => Promise<void>
        for (const tool of ['IR_LASER', 'DREMEL']) {
            const commit = vi.fn()
            await update({
                commit,
                state: { source: [] },
                rootState: {
                    printer: {
                        laser_tool_manager: { ...ir, detected_tool: tool },
                        'temperature_sensor aux_tool': { temperature: 42 },
                        'temperature_sensor Laser': { temperature: -120 },
                    },
                },
                rootGetters: {
                    'printer/getAvailableSensors': ['temperature_sensor aux_tool', 'temperature_sensor Laser'],
                    'printer/tempHistory/getTemperatureStoreSize': 2,
                },
            })
            const source = commit.mock.calls[0][1].data as PrinterTempHistoryStateSourceEntry
            expect(source[`${tool} (aux_tool)-temperature`]).toBe(42)
            expect(source[`${tool === 'IR_LASER' ? 'DREMEL' : 'IR_LASER'} (aux_tool)-temperature`]).toBeNull()
            expect(source['temperature_sensor Laser-temperature']).toBeNull()
        }
    })
})
