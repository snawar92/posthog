import React, { useState } from 'react'
import { CloseButton } from 'lib/components/CloseButton'
import { PropertyFilters } from '../../lib/components/PropertyFilters/PropertyFilters'
import { Select, Card, Radio } from 'antd'

import { actionsModel } from '~/models/actionsModel'
import { useValues } from 'kea'
import { PropertyFilter } from '~/types'
import { eventDefinitionsLogic } from 'scenes/events/eventDefinitionsLogic'

export function CohortGroup({
    onChange,
    onRemove,
    group,
    index,
    allowRemove,
}: {
    onChange: CallableFunction
    onRemove: CallableFunction
    group: Record<string, any>
    index: number
    allowRemove: boolean
}): JSX.Element {
    const { actionsGrouped } = useValues(actionsModel)
    const { eventDefinitions } = useValues(eventDefinitionsLogic)

    const [selected, setSelected] = useState((group.action_id && 'action') || (group.properties && 'property'))
    return (
        <Card title={false} style={{ margin: 0 }}>
            {allowRemove && <CloseButton className="float-right" onClick={onRemove} />}
            <div style={{ height: 32 }}>
                <span style={{ paddingRight: selected !== 'action' ? 40 : 0 }}>User has</span>
                {selected === 'action' && ' done '}
                <span style={{ paddingRight: 8 }}>
                    <Radio.Group
                        buttonStyle="solid"
                        onChange={(e) => {
                            setSelected(e.target.value)
                            onChange({})
                        }}
                        size="small"
                        value={selected}
                    >
                        <Radio.Button value="action" data-attr="cohort-group-action">
                            action or event
                        </Radio.Button>
                        <Radio.Button value="property" data-attr="cohort-group-property">
                            property
                        </Radio.Button>
                    </Radio.Group>
                </span>
                {selected == 'action' && (
                    <span>
                        in the last
                        <Radio.Group
                            buttonStyle="solid"
                            onChange={(e) =>
                                onChange({
                                    action_id: group.action_id,
                                    days: e.target.value,
                                })
                            }
                            size="small"
                            value={group.days}
                            style={{ paddingLeft: 8 }}
                        >
                            <Radio.Button value="1">day</Radio.Button>
                            <Radio.Button value="7">7 days</Radio.Button>
                            <Radio.Button value="30">month</Radio.Button>
                        </Radio.Group>
                    </span>
                )}
            </div>
            {selected && (
                <div style={{ minHeight: 38 }}>
                    {selected == 'property' && (
                        <PropertyFilters
                            endpoint="person"
                            pageKey={'cohort_' + index}
                            onChange={(properties: PropertyFilter[]) => {
                                onChange(
                                    properties.length
                                        ? {
                                              properties: properties,
                                              days: group.days,
                                          }
                                        : {}
                                )
                            }}
                            propertyFilters={group.properties || {}}
                            style={{ margin: '1rem 0 0' }}
                            popoverPlacement="bottomRight"
                        />
                    )}
                    {selected == 'action' && (
                        <div style={{ marginTop: '1rem' }}>
                            <Select
                                showSearch
                                placeholder="Select action..."
                                style={{ width: '100%' }}
                                onChange={(value) => {
                                    const res = value.split('__')
                                    const entity_type = res[0]
                                    const entity_id = res[1]
                                    if (entity_type === 'action') {
                                        onChange({ action_id: parseInt(entity_id), days: group.days })
                                    } else if (entity_type === 'event') {
                                        onChange({ event_id: entity_id, days: group.days })
                                    }
                                }}
                                filterOption={(input, option) =>
                                    option?.children && option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                                value={group.action_id || group.event_id}
                            >
                                <Select.OptGroup key={'Select an event'} label={'Select an event'}>
                                    {eventDefinitions.map((eventDef) => (
                                        <Select.Option key={eventDef.name} value={`event__${eventDef.name}`}>
                                            {eventDef.name}
                                        </Select.Option>
                                    ))}
                                </Select.OptGroup>
                                {actionsGrouped.map((typeGroup) => {
                                    if (typeGroup['options'].length > 0) {
                                        return (
                                            <Select.OptGroup key={typeGroup['label']} label={typeGroup['label']}>
                                                {typeGroup['options'].map((item) => (
                                                    <Select.Option key={item.value} value={`action__${item.value}`}>
                                                        {item.label}
                                                    </Select.Option>
                                                ))}
                                            </Select.OptGroup>
                                        )
                                    }
                                })}
                            </Select>
                        </div>
                    )}
                </div>
            )}
        </Card>
    )
}
