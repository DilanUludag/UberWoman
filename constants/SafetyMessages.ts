export const SAFETY_MESSAGES = [
  "I'm feeling uncomfortable. Can you please adjust the route?",
  "Please keep the conversation professional.",
  "I'm sharing my location with family for safety.",
  "Can you please turn down the music?",
  "I prefer if we don't make any stops.",
  "Please maintain appropriate driving speed.",
  "I'll be rating this ride based on safety and comfort.",
  "Thank you for being a professional driver.",
];

export const EMERGENCY_ACTIONS = [
  {
    id: 'share_location',
    title: 'Share Live Location',
    description: 'Share your current location with emergency contacts',
    action: 'SHARE_LOCATION',
  },
  {
    id: 'call_emergency',
    title: 'Call Emergency Services',
    description: 'Directly call 911 for immediate assistance',
    action: 'CALL_911',
  },
  {
    id: 'alert_contacts',
    title: 'Alert Emergency Contacts',
    description: 'Send alert message to your emergency contacts',
    action: 'ALERT_CONTACTS',
  },
  {
    id: 'record_audio',
    title: 'Start Recording',
    description: 'Begin audio recording for evidence',
    action: 'START_RECORDING',
  },
];