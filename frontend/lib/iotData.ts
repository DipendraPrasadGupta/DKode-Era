export interface IoTProject {
  id: number;
  slug: string;
  title: string;
  tagline: string;
  image: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  levelNum: 1 | 2 | 3;
  levelSubtitle: string;
  badgeColor: string;
  accentGlow: string;
  icon: string;
  description: string;
  workingPrinciple: string;
  realWorldImpact: string;
  sensors: string[];
  microcontroller: string;
  difficulty: 'Easy' | 'Moderate' | 'Advanced';
  estimatedHours: string;
  pinConnections: { component: string; pin: string; purpose: string }[];
  keyTakeaways: string[];
  codeSnippet: string;
  schematicSummary: string;
}

export interface LevelInfo {
  levelNum: 1 | 2 | 3;
  title: string;
  badge: string;
  tagline: string;
  focus: string[];
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
}

export const IOT_LEVELS: Record<number, LevelInfo> = {
  1: {
    levelNum: 1,
    title: 'Beginner',
    badge: 'LEVEL 1',
    tagline: 'Learn the Basics | Build Simple Devices | Understand How IoT Works',
    focus: ['Fundamental electronics', 'Sensor inputs & ADC', 'Basic actuation (buzzers, LEDs, simple servos)'],
    color: '#00d4ff',
    bgColor: 'rgba(0, 212, 255, 0.08)',
    borderColor: 'rgba(0, 212, 255, 0.25)',
    icon: '🌱',
  },
  2: {
    levelNum: 2,
    title: 'Intermediate',
    badge: 'LEVEL 2',
    tagline: 'Combine Sensors | Control Systems | Build Smart Applications',
    focus: ['Sensor fusion', 'Wireless Bluetooth connectivity', 'Motor drivers & feedback loops'],
    color: '#a855f7',
    bgColor: 'rgba(168, 85, 247, 0.08)',
    borderColor: 'rgba(168, 85, 247, 0.25)',
    icon: '⚙️',
  },
  3: {
    levelNum: 3,
    title: 'Advanced',
    badge: 'LEVEL 3',
    tagline: 'Build Complete Solutions | Integrate Multiple Components | Think Like a Developer',
    focus: ['Multi-node IoT integration', 'Cloud data telemetry & alerts', 'Dual-axis automation & autonomous robotics'],
    color: '#00e5a0',
    bgColor: 'rgba(0, 229, 160, 0.08)',
    borderColor: 'rgba(0, 229, 160, 0.25)',
    icon: '🚀',
  },
};

export const IOT_PROJECTS: IoTProject[] = [
  // ─── LEVEL 1: BEGINNER (Core Projects 1 to 5 from Poster) ─────────────────────
  {
    id: 1,
    slug: 'blind-stick',
    title: 'Blind Stick',
    tagline: 'Smart ultrasonic navigational mobility aid with audio-haptic feedback',
    image: '/iot/project-1.jpg',
    level: 'Beginner',
    levelNum: 1,
    levelSubtitle: 'Learn the Basics | Build Simple Devices | Understand How IoT Works',
    badgeColor: '#00d4ff',
    accentGlow: 'rgba(0, 212, 255, 0.2)',
    icon: '🦯',
    description: 'Helps visually impaired people navigate safely by detecting obstacles in real-time using ultrasonic sound wave reflections and alerting the user through progressive buzzer pulses and vibration motors.',
    workingPrinciple: 'The HC-SR04 ultrasonic sensor transmits high-frequency ultrasonic bursts. When an object obstructs the path, the reflected echo is timed to calculate the distance: Distance = (Echo Time × Speed of Sound) / 2. As distance shrinks below 50 cm, buzzer tone frequency and vibration pulse rates accelerate.',
    realWorldImpact: 'Empowers visually impaired individuals with greater autonomy, outdoor mobility confidence, and prevents dangerous head/chest-level collisions.',
    sensors: ['Ultrasonic Sensor (HC-SR04)', 'Active Piezo Buzzer', 'Vibration Motor', 'LDR Light Sensor'],
    microcontroller: 'Arduino Nano / Uno / ESP32',
    difficulty: 'Easy',
    estimatedHours: '3 - 5 Hours',
    pinConnections: [
      { component: 'HC-SR04 Trig', pin: 'Digital D9', purpose: 'Triggers 10µs ultrasonic sonic burst' },
      { component: 'HC-SR04 Echo', pin: 'Digital D10', purpose: 'Receives reflected echo pulse width' },
      { component: 'Piezo Buzzer', pin: 'Digital D11 (PWM)', purpose: 'Emits alert pitch proportional to distance' },
      { component: 'Vibration Motor', pin: 'Digital D6', purpose: 'Haptic tactile feedback' },
      { component: 'Power Supply', pin: '5V & GND', purpose: 'Regulated 5V from 9V battery' },
    ],
    keyTakeaways: [
      'Pulse Width Modulation (PWM) and pulseIn timing',
      'Ultrasonic echolocation physics',
      'Haptic and acoustic user interface design',
      'Battery power management for portable devices',
    ],
    codeSnippet: `// D-Kode Era: Smart Blind Stick Obstacle Detection
const int trigPin = 9;
const int echoPin = 10;
const int buzzerPin = 11;

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(buzzerPin, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH);
  float distanceCm = duration * 0.034 / 2;

  if (distanceCm > 0 && distanceCm < 45) {
    int beepInterval = map(distanceCm, 5, 45, 50, 400);
    digitalWrite(buzzerPin, HIGH);
    delay(40);
    digitalWrite(buzzerPin, LOW);
    delay(beepInterval);
  } else {
    digitalWrite(buzzerPin, LOW);
  }
}`,
    schematicSummary: 'HC-SR04 wired to pins D9/D10; buzzer & vibration motor driven via NPN transistor to prevent GPIO overcurrent.',
  },
  {
    id: 2,
    slug: 'automatic-dustbin',
    title: 'Automatic Dustbin',
    tagline: 'Touchless contactless lid mechanism with motion proximity sensing',
    image: '/iot/project-2.jpg',
    level: 'Beginner',
    levelNum: 1,
    levelSubtitle: 'Learn the Basics | Build Simple Devices | Understand How IoT Works',
    badgeColor: '#00d4ff',
    accentGlow: 'rgba(0, 212, 255, 0.2)',
    icon: '🗑️',
    description: 'Opens automatically when it detects approaching hands or waste, stays open for a convenient duration, and closes automatically with smooth servo damping for superior sanitary hygiene.',
    workingPrinciple: 'An ultrasonic proximity sensor mounted on the lid frame monitors the overhead zone. When an object is detected within 20cm, the microcontroller triggers an SG90 micro-servo motor to rotate from 0° (closed) to 90° (open), initiates a 4-second dwell countdown, and safely glides back to 0°.',
    realWorldImpact: 'Eliminates cross-contamination in medical clinics, commercial offices, public restrooms, and modern smart homes.',
    sensors: ['Ultrasonic Sensor (HC-SR04)', 'Servo Motor (SG90)', 'Status LED'],
    microcontroller: 'Arduino Uno / Nano',
    difficulty: 'Easy',
    estimatedHours: '2 - 4 Hours',
    pinConnections: [
      { component: 'Ultrasonic Trig', pin: 'Digital D7', purpose: 'Sonic pulse output' },
      { component: 'Ultrasonic Echo', pin: 'Digital D8', purpose: 'Proximity detection input' },
      { component: 'Servo Signal Pin', pin: 'Digital D9 (PWM)', purpose: 'PWM angle control (0° to 90°)' },
      { component: 'Status LED', pin: 'Digital D13', purpose: 'Illuminates while lid is active' },
    ],
    keyTakeaways: [
      'Micro-servo PWM angle calibration with Servo.h',
      'Non-blocking delay timing using millis()',
      'Hygienic human-machine interaction',
    ],
    codeSnippet: `#include <Servo.h>
Servo lidServo;
const int trigPin = 7, echoPin = 8;

void setup() {
  lidServo.attach(9);
  lidServo.write(0); // Closed
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
}

void loop() {
  digitalWrite(trigPin, LOW); delayMicroseconds(2);
  digitalWrite(trigPin, HIGH); delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  long dist = pulseIn(echoPin, HIGH) * 0.034 / 2;

  if (dist > 2 && dist < 22) {
    lidServo.write(90); // Open lid
    delay(4000);        // Dwell time
    lidServo.write(0);  // Close
  }
  delay(150);
}`,
    schematicSummary: 'Servo powered from external 5V rail with shared ground; HC-SR04 connected to pins 7 & 8.',
  },
  {
    id: 3,
    slug: 'day-light-system',
    title: 'Day Light System',
    tagline: 'Automated energy-conserving street & home lighting via ambient lux detection',
    image: '/iot/project-3.jpg',
    level: 'Beginner',
    levelNum: 1,
    levelSubtitle: 'Learn the Basics | Build Simple Devices | Understand How IoT Works',
    badgeColor: '#00d4ff',
    accentGlow: 'rgba(0, 212, 255, 0.2)',
    icon: '💡',
    description: 'Turns ON/OFF lights automatically based on ambient natural illumination levels, preventing wasteful daytime electricity consumption and providing hands-free nocturnal illumination.',
    workingPrinciple: 'A Light Dependent Resistor (LDR) configured in a voltage divider circuit varies its electrical resistance inversely with lux levels. The analog-to-digital converter (ADC) reads raw values (0-1023). When dusk falls below the calibrated threshold, a 5V relay module or high-power LED driver engages.',
    realWorldImpact: 'Reduces municipal streetlighting costs by up to 40% and automates off-grid solar home installations.',
    sensors: ['LDR Photoresistor', '10kΩ Resistor Voltage Divider', '5V Relay Module / High-Power LED'],
    microcontroller: 'Arduino Uno / ATTiny85 / ESP32',
    difficulty: 'Easy',
    estimatedHours: '2 - 3 Hours',
    pinConnections: [
      { component: 'LDR Analog Output', pin: 'Analog A0', purpose: 'Measures ambient lux voltage' },
      { component: 'Relay Control', pin: 'Digital D3', purpose: 'Drives AC/DC light relay switch' },
      { component: 'Indicator LED', pin: 'Digital D2', purpose: 'Nightfall detection indicator' },
    ],
    keyTakeaways: [
      'Voltage divider calculation & Ohm\'s law',
      'Analog-to-Digital conversion (ADC)',
      'Hysteresis implementation to prevent rapid light flickering at twilight',
    ],
    codeSnippet: `const int ldrPin = A0;
const int relayPin = 3;
const int LUX_THRESHOLD = 450;

void setup() {
  pinMode(relayPin, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int sensorValue = analogRead(ldrPin);
  if (sensorValue < LUX_THRESHOLD - 50) {
    digitalWrite(relayPin, HIGH);
  } else if (sensorValue > LUX_THRESHOLD + 50) {
    digitalWrite(relayPin, LOW);
  }
  delay(1000);
}`,
    schematicSummary: 'LDR connected to A0 with 10k pulldown; relay module with optocoupler isolation wired to D3.',
  },
  {
    id: 4,
    slug: 'cloth-saver-rain-detection',
    title: 'Cloth Saver / Rain Detection',
    tagline: 'Automated weather-protective awning system with raindrop conductivity sensing',
    image: '/iot/project-4.jpg',
    level: 'Beginner',
    levelNum: 1,
    levelSubtitle: 'Learn the Basics | Build Simple Devices | Understand How IoT Works',
    badgeColor: '#00d4ff',
    accentGlow: 'rgba(0, 212, 255, 0.2)',
    icon: '🌧️',
    description: 'Detects precipitation instantly and protects clothes drying on rooftops or balconies by automatically retracting the hanger/window awning with a servo motor and sounding a chime alert.',
    workingPrinciple: 'The rain sensor PCB features nickel-plated conductive copper traces arranged in interdigitated combs. When raindrops bridge the conductors, resistance plummets. An onboard LM393 comparator yields both analog moisture magnitude and instant digital threshold triggers to pull in the servo canopy.',
    realWorldImpact: 'Safeguards laundry and residential balconies from sudden tropical downpours common in Nepal and South Asia.',
    sensors: ['Raindrop Moisture Board (FC-37/LM393)', 'Servo Motor (SG90/MG995)', 'Active Buzzer'],
    microcontroller: 'Arduino Uno / Nano',
    difficulty: 'Easy',
    estimatedHours: '3 - 4 Hours',
    pinConnections: [
      { component: 'Rain Sensor Digital DO', pin: 'Digital D2', purpose: 'Instant precipitation interrupt' },
      { component: 'Rain Sensor Analog AO', pin: 'Analog A1', purpose: 'Measures rainfall intensity' },
      { component: 'Servo Motor (Awning)', pin: 'Digital D9 (PWM)', purpose: 'Draws protective cover over rack' },
      { component: 'Alarm Buzzer', pin: 'Digital D8', purpose: 'Audible indoor warning sound' },
    ],
    keyTakeaways: [
      'Conductivity sensor mechanics and comparator thresholds',
      'Hardware interrupt programming in C++',
      'Mechanical linkage design for motorized awnings',
    ],
    codeSnippet: `#include <Servo.h>
Servo awningServo;
const int rainPin = 2;
const int buzzerPin = 8;

void setup() {
  pinMode(rainPin, INPUT);
  pinMode(buzzerPin, OUTPUT);
  awningServo.attach(9);
  awningServo.write(0);
}

void loop() {
  bool isRaining = (digitalRead(rainPin) == LOW);
  if (isRaining) {
    awningServo.write(120);
    digitalWrite(buzzerPin, HIGH);
    delay(200);
    digitalWrite(buzzerPin, LOW);
  } else {
    awningServo.write(0);
    digitalWrite(buzzerPin, LOW);
  }
  delay(500);
}`,
    schematicSummary: 'FC-37 sensor probe on outdoor slant; LM393 board digital out to D2; high-torque servo on D9.',
  },
  {
    id: 5,
    slug: 'smart-irrigation-system',
    title: 'Smart Irrigation System',
    tagline: 'Precision soil moisture monitoring & automated sub-surface micro-pump actuation',
    image: '/iot/project-5.jpg',
    level: 'Beginner',
    levelNum: 1,
    levelSubtitle: 'Learn the Basics | Build Simple Devices | Understand How IoT Works',
    badgeColor: '#00d4ff',
    accentGlow: 'rgba(0, 212, 255, 0.2)',
    icon: '🌱',
    description: 'Monitors soil moisture levels in real-time and waters agricultural plots or indoor botanical pots automatically, ensuring optimum hydration while conserving precious water resources.',
    workingPrinciple: 'Capacitive/resistive soil moisture probes measure dielectric permittivity or conductivity in the root zone. When moisture values drop below the plant\'s specific wilting point, the microcontroller switches on a mini 5V submersible water pump via relay until optimal saturation is achieved.',
    realWorldImpact: 'Cuts water wastage in urban gardening and commercial greenhouse farms by up to 50% while boosting crop yield.',
    sensors: ['Capacitive Soil Moisture Sensor v1.2', '5V Submersible Water Pump', 'Single-Channel 5V Relay Module', 'I2C LCD 16x2 Display'],
    microcontroller: 'Arduino Uno / ESP32',
    difficulty: 'Easy',
    estimatedHours: '3 - 5 Hours',
    pinConnections: [
      { component: 'Soil Moisture AO', pin: 'Analog A0', purpose: 'Continuous volumetric moisture reading' },
      { component: 'Relay / Pump', pin: 'Digital D4', purpose: 'Enables 5V mini DC pump' },
      { component: 'I2C LCD SDA', pin: 'Analog A4', purpose: 'Displays moisture % on screen' },
      { component: 'I2C LCD SCL', pin: 'Analog A5', purpose: 'I2C clock synchronization' },
    ],
    keyTakeaways: [
      'Soil moisture calibration (dry air vs saturated water)',
      'Relay flyback diode inductive protection',
      'I2C communication protocol display formatting',
    ],
    codeSnippet: `const int soilPin = A0;
const int relayPin = 4;
const int DRY_THRESHOLD = 580;

void setup() {
  pinMode(relayPin, OUTPUT);
  digitalWrite(relayPin, HIGH);
  Serial.begin(9600);
}

void loop() {
  int moisture = analogRead(soilPin);
  if (moisture > DRY_THRESHOLD) {
    digitalWrite(relayPin, LOW);
    delay(3000);
    digitalWrite(relayPin, HIGH);
  }
  delay(10000);
}`,
    schematicSummary: 'Soil probe on A0; relay module driven on D4 with separate 5V supply for DC pump motor.',
  },

  // ─── LEVEL 2: INTERMEDIATE (Core Projects 6 to 10 from Poster) ───────────────
  {
    id: 6,
    slug: 'automatic-water-tap',
    title: 'Automatic Water Tap',
    tagline: 'Infrared proximity touchless faucet with solenoid valve fluid control',
    image: '/iot/project-6.jpg',
    level: 'Intermediate',
    levelNum: 2,
    levelSubtitle: 'Combine Sensors | Control Systems | Build Smart Applications',
    badgeColor: '#a855f7',
    accentGlow: 'rgba(168, 85, 247, 0.2)',
    icon: '🚰',
    description: 'Turns water flow ON/OFF automatically upon detecting hands underneath the spout, preventing faucet contamination and eliminating water spillage in public institutions and households.',
    workingPrinciple: 'An active infrared (IR) proximity sensor transmits modulated 38kHz infrared beams. When hands are placed below the aerator, reflected rays activate the phototransistor. The MCU energizes an electromagnetic 12V solenoid valve, lifting the plunger to allow water flow until hands are removed.',
    realWorldImpact: 'Saves thousands of liters of clean drinking water in schools, airports, and hospitals while providing contactless bacterial hygiene.',
    sensors: ['TCRT5000 / Sharp IR Proximity Sensor', '12V Brass Solenoid Valve', 'MOSFET / Relay Driver Board', 'Status Indicator LEDs'],
    microcontroller: 'Arduino Nano / ESP8266',
    difficulty: 'Moderate',
    estimatedHours: '4 - 6 Hours',
    pinConnections: [
      { component: 'IR Sensor Output', pin: 'Digital D2', purpose: 'Monitors hand proximity under tap' },
      { component: 'MOSFET Gate (IRFZ44N)', pin: 'Digital D3 (PWM)', purpose: 'Switches 12V DC to solenoid coil' },
      { component: 'Flyback Diode (1N4007)', pin: 'Parallel to valve', purpose: 'Absorbs reverse inductive voltage spikes' },
      { component: 'Flow Status LED', pin: 'Digital D5', purpose: 'Visual indication of active flow' },
    ],
    keyTakeaways: [
      'Driving inductive solenoid loads with power MOSFETs',
      'Reverse EMF suppression techniques',
      'Optical filtering against ambient sunlight false-triggers',
    ],
    codeSnippet: `const int irSensorPin = 2;
const int valveMosfetPin = 3;

void setup() {
  pinMode(irSensorPin, INPUT);
  pinMode(valveMosfetPin, OUTPUT);
}

void loop() {
  bool handsPresent = (digitalRead(irSensorPin) == LOW);
  if (handsPresent) {
    digitalWrite(valveMosfetPin, HIGH);
  } else {
    delay(400);
    digitalWrite(valveMosfetPin, LOW);
  }
}`,
    schematicSummary: 'IR sensor on D2; IRFZ44N N-channel MOSFET gate on D3 with 10k pulldown and 1N4007 across 12V valve.',
  },
  {
    id: 7,
    slug: 'fire-detection-alarm-system',
    title: 'Fire Detection & Alarm System',
    tagline: 'Multi-hazard optical flame & MQ-2 combustible gas / smoke early warning system',
    image: '/iot/project-7.jpg',
    level: 'Intermediate',
    levelNum: 2,
    levelSubtitle: 'Combine Sensors | Control Systems | Build Smart Applications',
    badgeColor: '#a855f7',
    accentGlow: 'rgba(168, 85, 247, 0.2)',
    icon: '🔥',
    description: 'Detects nascent smoke, combustible gas leaks, or infrared radiation from active flames and instantly triggers high-decibel audible alarms, strobe sirens, and automated emergency notification.',
    workingPrinciple: 'Utilizes dual-spectrum sensing: a photodiode sensitive to infrared wavelengths (760nm - 1100nm) generated by naked flames paired with an MQ-2 tin-dioxide semiconductor detecting combustible gas/smoke. When safety thresholds are breached, dual alerts (buzzer and alert LED) activate immediately.',
    realWorldImpact: 'Provides life-saving seconds of early evacuation warning in kitchens, server rooms, chemical warehouses, and residential complexes.',
    sensors: ['IR Flame Sensor Module', 'MQ-2 Gas / Smoke Sensor', '12V Piezo Siren / Buzzer', 'RGB Strobe LED'],
    microcontroller: 'Arduino Uno / ESP32',
    difficulty: 'Moderate',
    estimatedHours: '4 - 6 Hours',
    pinConnections: [
      { component: 'Flame Sensor Digital DO', pin: 'Digital D2', purpose: 'Hardware flame detection interrupt' },
      { component: 'MQ-2 Smoke Sensor AO', pin: 'Analog A0', purpose: 'Continuous PPM smoke density measurement' },
      { component: 'High-Pitch Siren', pin: 'Digital D8', purpose: 'Evacuation alarm tone' },
      { component: 'Strobe Flasher', pin: 'Digital D9', purpose: 'Visual emergency beacon' },
    ],
    keyTakeaways: [
      'Dual-sensor redundancy to eradicate false alarms',
      'Gas pre-heating and baseline calibration curves',
      'Emergency fail-safe circuitry',
    ],
    codeSnippet: `const int flamePin = 2;
const int gasPin = A0;
const int sirenPin = 8;
const int SMOKE_LIMIT = 380;

void setup() {
  pinMode(flamePin, INPUT);
  pinMode(sirenPin, OUTPUT);
}

void loop() {
  bool flame = (digitalRead(flamePin) == LOW);
  int gas = analogRead(gasPin);
  if (flame || gas > SMOKE_LIMIT) {
    for (int hz = 700; hz < 1400; hz += 50) {
      tone(sirenPin, hz);
      delay(15);
    }
  } else {
    noTone(sirenPin);
  }
  delay(100);
}`,
    schematicSummary: 'Flame sensor on D2, MQ-2 analog out on A0, buzzer driven via transistor on D8.',
  },
  {
    id: 8,
    slug: 'bluetooth-controlled-car',
    title: 'Bluetooth Controlled Car',
    tagline: 'Wireless smartphone-guided 4WD robotics platform with dual H-bridge motor control',
    image: '/iot/project-8.jpg',
    level: 'Intermediate',
    levelNum: 2,
    levelSubtitle: 'Combine Sensors | Control Systems | Build Smart Applications',
    badgeColor: '#a855f7',
    accentGlow: 'rgba(168, 85, 247, 0.2)',
    icon: '🚙',
    description: 'Control a high-mobility 4-wheel drive robotic chassis wirelessly from any Android/iOS smartphone app via Bluetooth UART commands for forward, reverse, steering, and speed acceleration.',
    workingPrinciple: 'The HC-05 / HC-06 Bluetooth module establishes a 2.4GHz Serial Port Profile (SPP) link with the smartphone. As buttons or virtual joysticks are moved, single-byte ASCII characters (\'F\', \'B\', \'L\', \'R\', \'S\') are streamed over UART to the MCU, which translates them into directional logic sent to the L298N dual H-bridge motor driver.',
    realWorldImpact: 'Foundational framework for teleoperated inspection rovers, bomb-diffusal robots, warehouse AGVs, and competitive robotics.',
    sensors: ['HC-05 / HC-06 Bluetooth Module', 'L298N Dual H-Bridge Motor Driver', '4x Geared DC Motors with Rubber Wheels', '7.4V/11.1V Li-Ion Battery Pack'],
    microcontroller: 'Arduino Uno / Nano / ESP32',
    difficulty: 'Moderate',
    estimatedHours: '5 - 8 Hours',
    pinConnections: [
      { component: 'HC-05 TX to Arduino RX', pin: 'Digital D2 (SoftwareSerial)', purpose: 'Receives phone commands' },
      { component: 'HC-05 RX to Arduino TX', pin: 'Digital D3 (via 1k/2k divider)', purpose: 'Safe 3.3V logic level shifting' },
      { component: 'L298N IN1, IN2 (Left)', pin: 'Digital D5, D6', purpose: 'Left track motor direction' },
      { component: 'L298N IN3, IN4 (Right)', pin: 'Digital D7, D8', purpose: 'Right track motor direction' },
      { component: 'L298N ENA, ENB (PWM)', pin: 'Digital D9, D10', purpose: 'Speed throttle regulation' },
    ],
    keyTakeaways: [
      'UART Serial packet parsing and ASCII protocol design',
      'H-Bridge transistor switching & back-EMF snubbing',
      'Voltage level shifting (5V to 3.3V) for Bluetooth transceivers',
    ],
    codeSnippet: `#include <SoftwareSerial.h>
SoftwareSerial BT(2, 3);
const int in1 = 5, in2 = 6, in3 = 7, in4 = 8;

void setup() {
  BT.begin(9600);
  pinMode(in1, OUTPUT); pinMode(in2, OUTPUT);
  pinMode(in3, OUTPUT); pinMode(in4, OUTPUT);
}

void loop() {
  if (BT.available()) {
    char cmd = BT.read();
    if (cmd == 'F') { digitalWrite(in1, HIGH); digitalWrite(in2, LOW); digitalWrite(in3, HIGH); digitalWrite(in4, LOW); }
    else if (cmd == 'S') { digitalWrite(in1, LOW); digitalWrite(in2, LOW); digitalWrite(in3, LOW); digitalWrite(in4, LOW); }
  }
}`,
    schematicSummary: 'Separate high-current battery line to L298N; common ground shared with Arduino logic.',
  },
  {
    id: 9,
    slug: 'obstacle-avoiding-car',
    title: 'Obstacle Avoiding Car',
    tagline: 'Autonomous navigation rover with sweep servo panning and collision avoidance algorithms',
    image: '/iot/project-9.jpg',
    level: 'Intermediate',
    levelNum: 2,
    levelSubtitle: 'Combine Sensors | Control Systems | Build Smart Applications',
    badgeColor: '#a855f7',
    accentGlow: 'rgba(168, 85, 247, 0.2)',
    icon: '🤖',
    description: 'An autonomous rover that navigates uncharted rooms without human intervention, scanning for obstacles with a revolving ultrasonic eye and plotting collision-free trajectories.',
    workingPrinciple: 'The car cruises forward while an ultrasonic sensor continuously measures clearance. When an obstacle is detected within 30cm, the rover halts, reverses slightly, commands a pan servo to scan 45° left and 45° right, compares which direction offers greater distance, pivots into the clearer heading, and resumes drive.',
    realWorldImpact: 'Underpins real-world robotics from robot vacuum cleaners (Roombas) to self-driving automotive LiDAR collision prevention systems.',
    sensors: ['HC-SR04 Ultrasonic Sensor', 'SG90 Micro Servo (Radar Turret)', 'L298N Motor Driver', '4x DC Geared Motors + Chassis'],
    microcontroller: 'Arduino Uno',
    difficulty: 'Moderate',
    estimatedHours: '5 - 7 Hours',
    pinConnections: [
      { component: 'Servo Pan Pin', pin: 'Digital D11', purpose: 'Pans sensor 0°-180° for directional radar' },
      { component: 'HC-SR04 Trig / Echo', pin: 'Digital D12 / D13', purpose: 'Distance ranging' },
      { component: 'L298N Motor Pins', pin: 'Digital D4, D5, D6, D7', purpose: 'Differential drive steering' },
    ],
    keyTakeaways: [
      'Autonomous path planning decision matrices',
      'Differential drive kinematic calculations',
      'Integration of motorized pan heads with distance sensors',
    ],
    codeSnippet: `int lookRight() {
  servo.write(30); delay(350);
  int d = readDistance();
  servo.write(90); return d;
}
void loop() {
  int distance = readDistance();
  if (distance <= 25) {
    stopMotors(); delay(150);
    moveBackward(); delay(300);
    int distR = lookRight();
    if (distR > 25) turnRight(); else turnLeft();
  } else {
    moveForward();
  }
}`,
    schematicSummary: 'HC-SR04 mounted atop SG90 servo horn at front bumper; L298N driving 4 wheels via differential pairs.',
  },
  {
    id: 10,
    slug: 'smart-parking-system',
    title: 'Smart Parking System',
    tagline: 'Automated multi-slot occupancy tracking with servo boom barrier & LCD display',
    image: '/iot/project-10.jpg',
    level: 'Intermediate',
    levelNum: 2,
    levelSubtitle: 'Combine Sensors | Control Systems | Build Smart Applications',
    badgeColor: '#a855f7',
    accentGlow: 'rgba(168, 85, 247, 0.2)',
    icon: '🅿️',
    description: 'Detects vacant parking slots in real time, manages vehicle entry/exit with an automated servo barrier gate, and displays available slot metrics on a live digital board.',
    workingPrinciple: 'Infrared proximity or ultrasonic sensors stationed at each parking bay track occupancy. Entry/exit gate sensors detect arriving cars: if vacant slots remain > 0, the boom gate servo lifts to 90° and decrements the counter. If capacity is full, the barrier remains locked and indicates "PARKING FULL".',
    realWorldImpact: 'Eliminates congestion in urban shopping malls, commercial complexes, and municipal parking garages by guiding motorists directly to open spaces.',
    sensors: ['3x - 5x IR Obstacle Sensors (Bay detection)', '2x IR Sensors (Gate Entry/Exit)', 'SG90 / MG90S Servo (Gate Barrier)', '16x2 I2C LCD Display', 'Red/Green Status LEDs'],
    microcontroller: 'Arduino Uno / ESP32',
    difficulty: 'Moderate',
    estimatedHours: '5 - 8 Hours',
    pinConnections: [
      { component: 'Entry IR Sensor', pin: 'Digital D2', purpose: 'Detects vehicle arriving at entrance' },
      { component: 'Exit IR Sensor', pin: 'Digital D3', purpose: 'Detects vehicle leaving exit gate' },
      { component: 'Gate Barrier Servo', pin: 'Digital D9 (PWM)', purpose: 'Lifts gate arm 0° to 90°' },
      { component: 'Slot 1 & Slot 2 IR', pin: 'Digital D4, D5', purpose: 'Monitors individual bay occupancy' },
      { component: 'I2C LCD Display', pin: 'SDA (A4), SCL (A5)', purpose: 'Shows "Slots Available: X / 4"' },
    ],
    keyTakeaways: [
      'State-machine architecture for transaction flow',
      'Multi-sensor aggregation and array tracking',
      'Physical access control gate mechanics',
    ],
    codeSnippet: `int totalSlots = 4;
int availableSlots = 4;

void loop() {
  if (digitalRead(entrySensor) == LOW && availableSlots > 0) {
    gateServo.write(90);
    delay(2500);
    gateServo.write(0);
    availableSlots--;
    updateLCD();
  }
}`,
    schematicSummary: 'IR sensors arrayed across entry and individual slots; servo barrier driven on D9; I2C LCD showing live counters.',
  },

  // ─── LEVEL 3: ADVANCED (Core Projects 11 to 15 from Poster) ──────────────────
  {
    id: 11,
    slug: 'sun-tracker',
    title: 'Sun Tracker (Dual-Axis)',
    tagline: 'Active astronomical photovoltaic solar tracking with closed-loop servo positioning',
    image: '/iot/project-11.jpg',
    level: 'Advanced',
    levelNum: 3,
    levelSubtitle: 'Build Complete Solutions | Integrate Multiple Components | Think Like a Developer',
    badgeColor: '#00e5a0',
    accentGlow: 'rgba(0, 229, 160, 0.2)',
    icon: '☀️',
    description: 'Tracks the sun\'s trajectory throughout the day in real time using a quadrant of light sensors and dual-axis servo motors, maximizing photovoltaic panel energy harvest efficiency.',
    workingPrinciple: 'A cross-shaped partition separates four LDR sensors (Top-Left, Top-Right, Bottom-Left, Bottom-Right). When the sun moves, cast shadows create differential lux voltages. The MCU calculates horizontal and vertical light gradients and drives horizontal (azimuth) and vertical (elevation) servos until illumination balances across all 4 quadrants.',
    realWorldImpact: 'Increases solar panel energy generation by 30% to 45% compared to static fixed solar rooftop systems.',
    sensors: ['4x LDR Light Dependent Resistors with Divider Matrix', '2x MG996R Metal-Gear Servos (Azimuth & Elevation)', 'Mini Solar PV Cell (5V - 12V)', 'INA219 Voltage/Current Sensor'],
    microcontroller: 'Arduino Uno / ESP32',
    difficulty: 'Advanced',
    estimatedHours: '6 - 9 Hours',
    pinConnections: [
      { component: 'Top LDRs (TL, TR)', pin: 'Analog A0, A1', purpose: 'Measures upper half sunlight lux' },
      { component: 'Bottom LDRs (BL, BR)', pin: 'Analog A2, A3', purpose: 'Measures lower half sunlight lux' },
      { component: 'Horizontal Servo', pin: 'Digital D9 (PWM)', purpose: 'Rotates base 0° to 180° East-West' },
      { component: 'Vertical Servo', pin: 'Digital D10 (PWM)', purpose: 'Tilts panel 0° to 90° Altitude' },
    ],
    keyTakeaways: [
      'Closed-loop differential feedback control algorithm',
      'Dual-axis gimbal mechanical construction and torque balance',
      'Solar irradiance telemetry and energy efficiency logging',
    ],
    codeSnippet: `int diffVertical = avgTop - avgBottom;
int diffHorizontal = avgLeft - avgRight;

if (abs(diffVertical) > 15) {
  if (avgTop > avgBottom) verticalPos--; else verticalPos++;
  vertServo.write(verticalPos);
}
if (abs(diffHorizontal) > 15) {
  if (avgLeft > avgRight) horizPos--; else horizPos++;
  horizServo.write(horizPos);
}`,
    schematicSummary: '4 LDRs arranged in 3D printed shadow cross; two high-torque metal-gear servos powered from separate 6V 2A regulator.',
  },
  {
    id: 12,
    slug: 'smart-city',
    title: 'Smart City Ecosystem',
    tagline: 'Integrated urban automation: adaptive streetlights, smart parking & emergency grids',
    image: '/iot/project-12.jpg',
    level: 'Advanced',
    levelNum: 3,
    levelSubtitle: 'Build Complete Solutions | Integrate Multiple Components | Think Like a Developer',
    badgeColor: '#00e5a0',
    accentGlow: 'rgba(0, 229, 160, 0.2)',
    icon: '🏙️',
    description: 'An integrated miniature smart city model incorporating automated vehicle-detecting street lighting, parking availability, environmental air quality monitoring, and emergency siren grids.',
    workingPrinciple: 'A multi-subsystem model where an ESP32 acts as the central urban gateway. Streetlights illuminate at low dimming (20%) at night to conserve power, and ramp to 100% brightness as IR sensors detect approaching vehicles, while MQ-135 sensors log urban air pollution and trigger cloud alerts.',
    realWorldImpact: 'Demonstrates modern municipal automation, reducing municipal power grid drain by 60% and enabling responsive civic infrastructure.',
    sensors: ['MQ-135 Air Quality Sensor', 'IR Vehicle Sensors for Adaptive Streetlights', 'LDR Dusk Sensor', 'Smart Parking Gates', 'ESP32 Wi-Fi Gateway'],
    microcontroller: 'ESP32 Dual-Core / NodeMCU',
    difficulty: 'Advanced',
    estimatedHours: '8 - 12 Hours',
    pinConnections: [
      { component: 'MQ-135 Gas', pin: 'GPIO 34 (ADC)', purpose: 'Monitors CO2, NOx, benzene pollution levels' },
      { component: 'Streetlight PWM Array', pin: 'GPIO 18, 19', purpose: 'Energy-saving adaptive street illumination' },
      { component: 'IR Approach Sensors', pin: 'GPIO 21, 22', purpose: 'Detects oncoming traffic to ramp lights' },
      { component: 'Wi-Fi Status Telemetry', pin: 'Built-in Radio', purpose: 'Streams urban health stats to web dashboard' },
    ],
    keyTakeaways: [
      'Multi-threaded concurrent programming with FreeRTOS on ESP32',
      'IoT MQTT telemetry to central cloud dashboards',
      'Urban energy conservation algorithms',
    ],
    codeSnippet: `void taskStreetlights() {
  int ambient = analogRead(LDR_PIN);
  if (ambient < 500) {
    if (digitalRead(CAR_IR_PIN) == LOW) ledcWrite(0, 255);
    else ledcWrite(0, 50);
  } else {
    ledcWrite(0, 0);
  }
}`,
    schematicSummary: 'ESP32 controls MOSFET-driven LED array, reads analog environmental gas sensors, and posts MQTT payloads.',
  },
  {
    id: 13,
    slug: 'smart-traffic-light-system',
    title: 'Smart Traffic Light System',
    tagline: 'Density-based dynamic traffic signal timing with emergency vehicle green-wave preemption',
    image: '/iot/project-13.jpg',
    level: 'Advanced',
    levelNum: 3,
    levelSubtitle: 'Build Complete Solutions | Integrate Multiple Components | Think Like a Developer',
    badgeColor: '#00e5a0',
    accentGlow: 'rgba(0, 229, 160, 0.2)',
    icon: '🚦',
    description: 'Replaces rigid fixed timers with intelligent computer-controlled traffic lights that calculate real-time vehicle density on each junction lane and automatically clears routes for ambulances.',
    workingPrinciple: 'Each intersection arm is fitted with a multi-stage ultrasonic or IR sensor array. The microcontroller calculates vehicle queue density per lane: high-density roads are granted extended green phases (e.g. 45s) while empty lanes get quick 10s cycles. An RF/IR receiver triggers an instant "Green Wave" priority when emergency vehicles approach.',
    realWorldImpact: 'Cuts traffic congestion delays by 35% in congested metro cities like Kathmandu and Butwal, preventing gridlock and saving lives during emergency transit.',
    sensors: ['8x - 12x IR Queue Sensors / Ultrasonic arrays', '12x High-Brightness LEDs (Red, Yellow, Green x 4 lanes)', 'RF 433MHz Receiver (Ambulance override)'],
    microcontroller: 'Arduino Mega 2560 / STM32 / ESP32',
    difficulty: 'Advanced',
    estimatedHours: '6 - 10 Hours',
    pinConnections: [
      { component: 'Lane 1 IR Density Sensors', pin: 'Pins D22, D23', purpose: 'Detects queue depth on Lane 1' },
      { component: 'Lane 2 IR Density Sensors', pin: 'Pins D24, D25', purpose: 'Detects queue depth on Lane 2' },
      { component: 'Lane 1 R/Y/G Traffic LEDs', pin: 'Pins D2, D3, D4', purpose: 'Lane 1 Signal head' },
      { component: 'Lane 2 R/Y/G Traffic LEDs', pin: 'Pins D5, D6, D7', purpose: 'Lane 2 Signal head' },
      { component: 'RF Ambulance Interrupt', pin: 'Pin D18 (INT)', purpose: 'Instant priority preemption trigger' },
    ],
    keyTakeaways: [
      'Dynamic scheduling algorithms and priority queuing',
      'Finite State Machine (FSM) safety-critical timing',
      'Emergency vehicle preemption (EVP) protocols',
    ],
    codeSnippet: `int lane1Density = countVehicles(LANE_1);
int greenDuration = 10000;
if (lane1Density > 5) greenDuration = 25000;
setSignals(LANE1_GREEN);
delay(greenDuration);`,
    schematicSummary: 'Multi-lane LED arrays driven with current-limiting resistors; queue sensors multiplexed to GPIO pins.',
  },
  {
    id: 14,
    slug: 'water-level-monitoring',
    title: 'Water Level Monitoring & Cloud Alerts',
    tagline: 'Ultrasonic non-contact tank reservoir telemetry with automatic dry-run pump cutoff',
    image: '/iot/project-14.jpg',
    level: 'Advanced',
    levelNum: 3,
    levelSubtitle: 'Build Complete Solutions | Integrate Multiple Components | Think Like a Developer',
    badgeColor: '#00e5a0',
    accentGlow: 'rgba(0, 229, 160, 0.2)',
    icon: '💧',
    description: 'Monitors overhead and underground water reservoirs with millimeter accuracy, automatically refills tanks via high-power AC relay controls, prevents dry-run pump burnouts, and sends push alerts.',
    workingPrinciple: 'A waterproof JSN-SR04T ultrasonic sensor mounted atop the water tank fires pulses downward to calculate water depth without physical contact. An ESP32 computes percentage volume (0-100%). When level dips below 20%, the relay ignites the pump. Once full (95%), it shuts down and pings the user via Telegram/Blynk/SMS.',
    realWorldImpact: 'Prevents catastrophic roof tank overflows, dry-run motor burnouts, and water shortages in residential and industrial storage facilities across Nepal.',
    sensors: ['Waterproof Ultrasonic Sensor (JSN-SR04T)', 'Float Switch (Bottom Dry-run Protector)', '30A Heavy-Duty Relay Module', 'Buzzer & OLED Display'],
    microcontroller: 'ESP32 / ESP8266 (Wi-Fi Enabled)',
    difficulty: 'Advanced',
    estimatedHours: '6 - 9 Hours',
    pinConnections: [
      { component: 'JSN-SR04T Trig', pin: 'GPIO 5', purpose: 'Triggers waterproof ultrasonic ping' },
      { component: 'JSN-SR04T Echo', pin: 'GPIO 18', purpose: 'Receives water surface reflection' },
      { component: '30A Relay (Water Pump)', pin: 'GPIO 19', purpose: 'Controls high-voltage water pump' },
      { component: 'Float Switch (Dry-run)', pin: 'GPIO 21', purpose: 'Emergency cutoff if source well is dry' },
      { component: 'I2C OLED Display', pin: 'SDA (21), SCL (22)', purpose: 'Shows live % volume and pump status' },
    ],
    keyTakeaways: [
      'Waterproof acoustic sensor characteristics and acoustic dead-zones',
      'Industrial high-power AC inductive relay switching (up to 2HP pumps)',
      'Wi-Fi telemetry, REST APIs, and instant smartphone notifications',
    ],
    codeSnippet: `int percentage = map(waterDepth, 15, TANK_HEIGHT_CM - 10, 0, 100);
if (percentage < 20 && !pumpRunning) {
  digitalWrite(pumpRelay, HIGH);
  pumpRunning = true;
  sendTelegramAlert("💧 Water Tank Low (20%). Pump Activated.");
} else if (percentage >= 95 && pumpRunning) {
  digitalWrite(pumpRelay, LOW);
  pumpRunning = false;
  sendTelegramAlert("✅ Water Tank Full (95%). Pump Deactivated.");
}`,
    schematicSummary: 'Waterproof ultrasonic sensor inside tank lid; 30A optocoupled relay with snubber circuit for AC motor.',
  },
  {
    id: 15,
    slug: 'bluetooth-robot-car',
    title: 'Advanced Bluetooth Robot Car',
    tagline: 'Multi-functional robotic platform with Bluetooth telemetry, speed control, & smart headlamps',
    image: '/iot/project-15.jpg',
    level: 'Advanced',
    levelNum: 3,
    levelSubtitle: 'Build Complete Solutions | Integrate Multiple Components | Think Like a Developer',
    badgeColor: '#00e5a0',
    accentGlow: 'rgba(0, 229, 160, 0.2)',
    icon: '🏎️',
    description: 'Next-generation 4WD robot car featuring customizable wireless smartphone controls, precision PWM speed curves, ultrasonic obstacle radar, automatic night headlamps, and telemetry feedback.',
    workingPrinciple: 'An advanced hybrid integration combining wireless Bluetooth SPP / BLE communication with an onboard obstacle-sensing radar and active headlights. The smartphone app allows switching between Manual Driving Mode, Autonomous Obstacle Avoidance Mode, and Line Tracking Mode on the fly.',
    realWorldImpact: 'Comprehensive multi-disciplinary platform preparing young engineers for competitive robotics tournaments, mechatronics degrees, and unmanned ground vehicle (UGV) development.',
    sensors: ['ESP32 / Arduino with HC-05 BLE', 'L298N 4A Motor Driver with Dual PWM', 'Ultrasonic Pan Turret', 'High-Lumen LED Headlights', 'Infrared Ground Array'],
    microcontroller: 'Arduino Mega / ESP32',
    difficulty: 'Advanced',
    estimatedHours: '8 - 14 Hours',
    pinConnections: [
      { component: 'Bluetooth RX/TX', pin: 'Serial1 (D18/D19)', purpose: 'High-speed UART smartphone telemetry' },
      { component: 'Motor PWM Speed Pins', pin: 'D2, D3, D4, D5', purpose: 'Independent 4-wheel PWM traction' },
      { component: 'Headlight Relay/MOSFET', pin: 'D8', purpose: 'Automated night illumination' },
      { component: 'Pan Servo Turret', pin: 'D9', purpose: '180° radar surveillance' },
      { component: 'Buzzer Horn', pin: 'D10', purpose: 'Smartphone triggered audio horn' },
    ],
    keyTakeaways: [
      'Multi-mode state machine architecture (Manual vs Autonomous)',
      'Hardware timer PWM speed ramping for smooth acceleration',
      'Mechatronic system integration and chassis weight balancing',
    ],
    codeSnippet: `char currentMode = 'M';
void loop() {
  if (Serial1.available()) {
    char cmd = Serial1.read();
    if (cmd == 'X') currentMode = 'A';
    if (cmd == 'M') currentMode = 'M';
    if (currentMode == 'M') processManualDrive(cmd);
  }
  if (currentMode == 'A') runAutonomousObstacleAvoidance();
}`,
    schematicSummary: 'Heavy duty 4-wheel chassis with dual L298N drivers, 3S LiPo battery, buck converter for 5V MCU logic.',
  },

  // ─── LEVEL 1: BEGINNER (Extended Practical Projects 16 to 20) ─────────────────
  {
    id: 16,
    slug: 'touchless-sanitizer-dispenser',
    title: 'Touchless Sanitizer Dispenser',
    tagline: 'Infrared proximity triggered contactless micro-pump mist atomizer',
    image: '/iot/project-16.jpg',
    level: 'Beginner',
    levelNum: 1,
    levelSubtitle: 'Learn the Basics | Build Simple Devices | Understand How IoT Works',
    badgeColor: '#00d4ff',
    accentGlow: 'rgba(0, 212, 255, 0.2)',
    icon: '🧴',
    description: 'Dispenses a metered dose of liquid hand sanitizer automatically upon optical proximity detection, preventing contact contamination in schools, clinics, and offices.',
    workingPrinciple: 'An infrared obstacle sensor detects hand placement within 6cm. The microcontroller triggers a 5V micro-diaphragm pump for exactly 650 milliseconds to dispense 1.5mL of sanitizer, followed by a 2-second cooldown delay to prevent double-pumping.',
    realWorldImpact: 'Crucial hygiene infrastructure for public institutions, schools, and health clinics.',
    sensors: ['TCRT5000 IR Proximity Sensor', '5V Micro Diaphragm Pump', 'TIP120 Darlington Transistor', 'Status LED'],
    microcontroller: 'Arduino Nano / ATTiny85',
    difficulty: 'Easy',
    estimatedHours: '2 - 3 Hours',
    pinConnections: [
      { component: 'IR Sensor Output', pin: 'Digital D2', purpose: 'Detects hand presence' },
      { component: 'Pump Transistor Base', pin: 'Digital D3', purpose: 'Switches 5V pump current' },
      { component: 'Dispense LED', pin: 'Digital D13', purpose: 'Visual dispense feedback' },
    ],
    keyTakeaways: ['Transistor saturation switching', 'Precise timing calibration', 'Liquid pump handling'],
    codeSnippet: `void loop() {
  if (digitalRead(2) == LOW) {
    digitalWrite(3, HIGH);
    delay(650);
    digitalWrite(3, LOW);
    delay(2000);
  }
}`,
    schematicSummary: 'IR sensor on D2; TIP120 transistor on D3 driving 5V pump with 1N4007 flyback diode.',
  },
  {
    id: 17,
    slug: 'digital-visitor-counter',
    title: 'Bidirectional Visitor Counter',
    tagline: 'Dual infrared break-beam passenger traffic counter with live headcount display',
    image: '/iot/project-17.jpg',
    level: 'Beginner',
    levelNum: 1,
    levelSubtitle: 'Learn the Basics | Build Simple Devices | Understand How IoT Works',
    badgeColor: '#00d4ff',
    accentGlow: 'rgba(0, 212, 255, 0.2)',
    icon: '👥',
    description: 'Tracks people entering and leaving a room using two sequential optical beam sensors, calculating real-time room occupancy and controlling room lighting.',
    workingPrinciple: 'Two IR beam sensors (Sensor A and Sensor B) are spaced 10cm apart at doorway height. If Sensor A triggers before B, a person is entering (Counter++). If B triggers before A, a person is exiting (Counter--). If count > 0, room lights stay ON.',
    realWorldImpact: 'Automates energy saving in seminar halls, libraries, and retail customer analytics.',
    sensors: ['2x IR Break-Beam Sensors', '16x2 I2C LCD', 'Relay Module for Room Light'],
    microcontroller: 'Arduino Uno / Nano',
    difficulty: 'Easy',
    estimatedHours: '3 - 4 Hours',
    pinConnections: [
      { component: 'Entry Sensor A', pin: 'Digital D2', purpose: 'First beam trigger' },
      { component: 'Exit Sensor B', pin: 'Digital D3', purpose: 'Second beam trigger' },
      { component: 'Room Light Relay', pin: 'Digital D4', purpose: 'Room illumination switch' },
    ],
    keyTakeaways: ['Sequence detection logic', 'State tracking', 'I2C LCD formatting'],
    codeSnippet: `if (beamA && !beamB) { waitForB(); count++; }
else if (beamB && !beamA) { waitForA(); count--; }
digitalWrite(relayPin, count > 0 ? HIGH : LOW);`,
    schematicSummary: 'Dual IR sensors wired to interrupt pins D2 and D3; I2C LCD displaying live headcount.',
  },
  {
    id: 18,
    slug: 'smart-temp-humidity-monitor',
    title: 'Ambient Climate & Heat Index Monitor',
    tagline: 'Digital environmental temperature & relative humidity logging on OLED display',
    image: '/iot/project-18.jpg',
    level: 'Beginner',
    levelNum: 1,
    levelSubtitle: 'Learn the Basics | Build Simple Devices | Understand How IoT Works',
    badgeColor: '#00d4ff',
    accentGlow: 'rgba(0, 212, 255, 0.2)',
    icon: '🌡️',
    description: 'Monitors ambient indoor temperature, relative humidity, and calculates the thermal heat index, displaying metrics and comfort alerts on a graphic monochrome OLED screen.',
    workingPrinciple: 'A capacitive humidity sensor and thermistor inside the DHT22 yield 16-bit digital temperature and humidity data over a single-wire bus. The MCU computes dew point and comfort status.',
    realWorldImpact: 'Essential for server room climate maintenance, museum archives, and greenhouse plant incubation.',
    sensors: ['DHT11 / DHT22 Digital Sensor', '0.96-inch I2C SSD1306 OLED Display', 'Alert Buzzer'],
    microcontroller: 'Arduino Nano / ESP32',
    difficulty: 'Easy',
    estimatedHours: '2 - 3 Hours',
    pinConnections: [
      { component: 'DHT22 Data', pin: 'Digital D4', purpose: 'Single-wire bidirectional data' },
      { component: 'OLED SDA/SCL', pin: 'Pins A4 / A5', purpose: 'I2C display graphics' },
    ],
    keyTakeaways: ['Single-wire digital protocol', 'OLED graphic rendering', 'Heat index formulas'],
    codeSnippet: `float h = dht.readHumidity();
float t = dht.readTemperature();
display.clearDisplay();
display.print("Temp: "); display.print(t); display.println(" C");
display.print("Humidity: "); display.print(h); display.println(" %");
display.display();`,
    schematicSummary: 'DHT22 with 10k pullup to 5V; SSD1306 OLED connected over I2C bus.',
  },
  {
    id: 19,
    slug: 'lpg-gas-leakage-detector',
    title: 'LPG Gas Leakage Detector',
    tagline: 'Domestic propane/butane cylinder leak detection with auto exhaust fan activation',
    image: '/iot/project-19.jpg',
    level: 'Beginner',
    levelNum: 1,
    levelSubtitle: 'Learn the Basics | Build Simple Devices | Understand How IoT Works',
    badgeColor: '#00d4ff',
    accentGlow: 'rgba(0, 212, 255, 0.2)',
    icon: '⚠️',
    description: 'Detects combustible LPG, propane, and butane gas leaks in residential kitchens, sounds an alarm, and automatically starts an exhaust ventilation fan to prevent explosions.',
    workingPrinciple: 'The MQ-6 semiconductor heating element changes electrical conductivity when target gas molecules adsorb onto its tin dioxide surface. When PPM levels exceed 200, an exhaust relay triggers immediately.',
    realWorldImpact: 'Prevents tragic residential kitchen fires and LPG cylinder blast fatalities.',
    sensors: ['MQ-6 / MQ-2 LPG Sensor', '12V DC Exhaust Fan Relay', 'High-Decibel Piezo Siren'],
    microcontroller: 'Arduino Uno / Nano',
    difficulty: 'Easy',
    estimatedHours: '3 - 4 Hours',
    pinConnections: [
      { component: 'MQ-6 Analog Out', pin: 'Analog A0', purpose: 'LPG gas density reading' },
      { component: 'Fan Relay Pin', pin: 'Digital D7', purpose: 'Turns ON exhaust fan' },
      { component: 'Alarm Buzzer', pin: 'Digital D8', purpose: 'Kitchen alarm siren' },
    ],
    keyTakeaways: ['SnO2 sensor characteristics', 'Safe ventilation switching', 'Threshold tuning'],
    codeSnippet: `int gasLvl = analogRead(A0);
if (gasLvl > 350) {
  digitalWrite(fanRelay, HIGH);
  tone(buzzerPin, 1000);
} else {
  digitalWrite(fanRelay, LOW);
  noTone(buzzerPin);
}`,
    schematicSummary: 'MQ-6 analog pin to A0; relay driving 12V exhaust fan; buzzer on D8.',
  },
  {
    id: 20,
    slug: 'automatic-railway-gate-control',
    title: 'Automatic Railway Gate Control',
    tagline: 'Train arrival proximity detection with automated dual servo barrier arms',
    image: '/iot/project-20.jpg',
    level: 'Beginner',
    levelNum: 1,
    levelSubtitle: 'Learn the Basics | Build Simple Devices | Understand How IoT Works',
    badgeColor: '#00d4ff',
    accentGlow: 'rgba(0, 212, 255, 0.2)',
    icon: '🚂',
    description: 'Automates unmanned level-crossings: detects approaching trains on railway tracks, closes motorized boom barriers, flashes warning lights, and re-opens after the train has cleared.',
    workingPrinciple: 'Two IR track sensors installed 50cm ahead and after the road crossing detect oncoming rail traffic. When train presence triggers the entry sensor, dual servo gates lower and traffic lights turn red.',
    realWorldImpact: 'Eliminates fatal train-automobile accidents at unmanned rural railway crossings.',
    sensors: ['2x Track Proximity IR Sensors', '2x SG90 Micro Servos (Dual Gates)', 'Red/Green Crossway LEDs', 'Buzzer'],
    microcontroller: 'Arduino Uno',
    difficulty: 'Easy',
    estimatedHours: '3 - 5 Hours',
    pinConnections: [
      { component: 'Train Entry IR', pin: 'Digital D2', purpose: 'Detects oncoming train' },
      { component: 'Train Exit IR', pin: 'Digital D3', purpose: 'Detects train departure' },
      { component: 'Gate Servos 1 & 2', pin: 'Digital D9, D10', purpose: 'Lowers barriers to 0°' },
    ],
    keyTakeaways: ['Dual-servo synchronous control', 'Safety fail-safe protocols', 'Linear track logic'],
    codeSnippet: `if (digitalRead(trainEntry) == LOW) {
  gate1.write(0); gate2.write(0); // Close
  soundAlarm();
}
if (digitalRead(trainExit) == LOW) {
  gate1.write(90); gate2.write(90); // Open
}`,
    schematicSummary: 'Dual IR sensors along track line; dual SG90 servos synchronized on PWM pins D9 and D10.',
  },

  // ─── LEVEL 2: INTERMEDIATE (Extended Practical Projects 21 to 25) ─────────────
  {
    id: 21,
    slug: 'rfid-smart-door-lock',
    title: 'RFID Smart Door Lock & Access Control',
    tagline: '13.56MHz contactless MIFARE card authentication with electromagnetic strike release',
    image: '/iot/project-21.jpg',
    level: 'Intermediate',
    levelNum: 2,
    levelSubtitle: 'Combine Sensors | Control Systems | Build Smart Applications',
    badgeColor: '#a855f7',
    accentGlow: 'rgba(168, 85, 247, 0.2)',
    icon: '🔑',
    description: 'Secures doors with contactless RFID smart cards or key fobs, authenticates UID codes, unlocks electronic door latches, and denies access to unauthorized tags with audible alerts.',
    workingPrinciple: 'The RC522 reader generates a 13.56MHz electromagnetic field. When an RFID tag enters the field, inductive coupling powers the card chip, which transmits its unique 4-byte UID. The MCU compares the UID against an authorized database.',
    realWorldImpact: 'Modern keyless security for offices, college laboratories, student dormitories, and hotel rooms.',
    sensors: ['RC522 RFID SPI Module', '12V Electronic Solenoid Lock', 'MOSFET / Relay Module', 'Buzzer & LEDs'],
    microcontroller: 'Arduino Uno / ESP32',
    difficulty: 'Moderate',
    estimatedHours: '4 - 6 Hours',
    pinConnections: [
      { component: 'RC522 SDA / SS', pin: 'Digital D10', purpose: 'SPI Slave Select' },
      { component: 'RC522 SCK / MOSI / MISO', pin: 'Pins D13, D11, D12', purpose: 'Hardware SPI communication' },
      { component: 'Lock Relay', pin: 'Digital D7', purpose: 'Unlocks 12V solenoid latch' },
    ],
    keyTakeaways: ['SPI serial peripheral interface', 'Cryptographic UID verification', 'Inductive lock drivers'],
    codeSnippet: `if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
  if (isAuthorized(mfrc522.uid.uidByte)) {
    digitalWrite(lockPin, HIGH); // Unlock
    delay(3000);
    digitalWrite(lockPin, LOW);
  }
}`,
    schematicSummary: 'RC522 connected to hardware SPI pins; relay driving 12V DC solenoid strike.',
  },
  {
    id: 22,
    slug: 'gesture-controlled-robot',
    title: 'Hand Gesture Controlled Robotic Vehicle',
    tagline: 'Wearable MEMS accelerometer hand glove with 2.4GHz wireless motion teleoperation',
    image: '/iot/project-22.jpg',
    level: 'Intermediate',
    levelNum: 2,
    levelSubtitle: 'Combine Sensors | Control Systems | Build Smart Applications',
    badgeColor: '#a855f7',
    accentGlow: 'rgba(168, 85, 247, 0.2)',
    icon: '🖐️',
    description: 'Operate a robotic vehicle or electric wheelchair through intuitive natural hand tilts (pitch and roll) measured by a wearable IMU sensor glove transmitting wireless RF packets.',
    workingPrinciple: 'An MPU-6050 6-axis gyroscope/accelerometer on a glove reads pitch (tilt forward/back) and roll (tilt left/right). An NRF24L01 radio sends coordinate packets to the receiver rover, which drives motor speeds accordingly.',
    realWorldImpact: 'Assistive wheelchair teleoperation for disabled individuals and hazardous inspection rovers.',
    sensors: ['MPU-6050 6-Axis IMU (I2C)', '2x NRF24L01+ 2.4GHz RF Transceivers', 'L298N Motor Driver', '4WD Chassis'],
    microcontroller: '2x Arduino Nano (Transmitter Glove + Receiver Car)',
    difficulty: 'Moderate',
    estimatedHours: '6 - 9 Hours',
    pinConnections: [
      { component: 'MPU-6050 SDA/SCL', pin: 'Pins A4, A5', purpose: 'I2C accelerometer readings' },
      { component: 'NRF24L01 CE/CSN', pin: 'Pins D9, D10', purpose: 'RF radio control' },
      { component: 'Motor Control (Receiver)', pin: 'Pins D2, D3, D4, D5', purpose: 'Rover drive motors' },
    ],
    keyTakeaways: ['I2C sensor fusion and DMP motion processing', '2.4GHz RF packet transmission', 'Intuitive gesture mapping'],
    codeSnippet: `mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);
if (ax < -4000) radio.write(&cmdF, sizeof(cmdF)); // Tilt forward
else if (ax > 4000) radio.write(&cmdB, sizeof(cmdB)); // Tilt back`,
    schematicSummary: 'Wearable glove with MPU-6050 and NRF24L01; rover chassis with matching receiver.',
  },
  {
    id: 23,
    slug: 'tabletop-cleaner-bot',
    title: 'Edge-Detecting Tabletop Cleaner Bot',
    tagline: 'Mini autonomous vacuum cleaner with downward infrared cliff-fall prevention',
    image: '/iot/project-23.jpg',
    level: 'Intermediate',
    levelNum: 2,
    levelSubtitle: 'Combine Sensors | Control Systems | Build Smart Applications',
    badgeColor: '#a855f7',
    accentGlow: 'rgba(168, 85, 247, 0.2)',
    icon: '🧹',
    description: 'Cleans desks and conference tables autonomously with a micro-suction fan while detecting table edges and avoiding plummeting off edges using downward cliff sensors.',
    workingPrinciple: 'Two high-speed infrared reflective optical sensors look straight down at the table surface. When the robot approaches a precipice, reflected light disappears (Cliff detected), triggering an immediate emergency reverse and pivot turn.',
    realWorldImpact: 'Core foundation for autonomous consumer vacuum cleaners and window-cleaning robots.',
    sensors: ['2x Downward IR Cliff Sensors', '5V Centrifugal Suction Fan', 'L9110S Motor Driver', 'Twin DC Gear Motors'],
    microcontroller: 'Arduino Nano',
    difficulty: 'Moderate',
    estimatedHours: '4 - 6 Hours',
    pinConnections: [
      { component: 'Left Cliff IR', pin: 'Digital D2', purpose: 'Monitors left wheel surface' },
      { component: 'Right Cliff IR', pin: 'Digital D3', purpose: 'Monitors right wheel surface' },
      { component: 'Suction Fan Driver', pin: 'Digital D8', purpose: 'Powers miniature vacuum motor' },
    ],
    keyTakeaways: ['Cliff detection fail-safes', 'Differential motor steering', 'Airflow chamber design'],
    codeSnippet: `bool leftCliff = (digitalRead(leftPin) == HIGH);
if (leftCliff) {
  moveBackward(); delay(200);
  turnRight(); delay(300);
}`,
    schematicSummary: 'Down-facing TCRT5000 sensors on bumper; L9110S driving compact motors.',
  },
  {
    id: 24,
    slug: 'sound-activated-light-matrix',
    title: 'Sound-Activated Smart Light Matrix',
    tagline: 'Acoustic frequency spectrum analyzer with WS2812B NeoPixel music visualization',
    image: '/iot/project-24.jpg',
    level: 'Intermediate',
    levelNum: 2,
    levelSubtitle: 'Combine Sensors | Control Systems | Build Smart Applications',
    badgeColor: '#a855f7',
    accentGlow: 'rgba(168, 85, 247, 0.2)',
    icon: '🎵',
    description: 'Visualizes music and ambient speech through dynamic color equalizer waves on individually addressable WS2812B RGB NeoPixel LED strips with sound sensitivity calibration.',
    workingPrinciple: 'An electret microphone amplifier (MAX4466) captures acoustic pressure waves. The ADC samples at audio rates, calculates peak-to-peak amplitude or FFT frequency bands, and maps loudness to vivid RGB color palettes.',
    realWorldImpact: 'Smart home entertainment lighting, studio audio visualizers, and sensory aid installations for the deaf.',
    sensors: ['MAX4466 / Electret Mic Module', 'WS2812B Addressable RGB LED Strip (60 LEDs/m)'],
    microcontroller: 'Arduino Uno / ESP32',
    difficulty: 'Moderate',
    estimatedHours: '4 - 6 Hours',
    pinConnections: [
      { component: 'Mic Audio Out', pin: 'Analog A0', purpose: 'Samples audio waveform' },
      { component: 'WS2812B Data Pin', pin: 'Digital D6', purpose: 'High-speed 800kHz LED data line' },
    ],
    keyTakeaways: ['Audio sampling and peak-to-peak windowing', 'FastLED / Adafruit_NeoPixel programming', 'Decoupling capacitor power filtering'],
    codeSnippet: `int peak = sampleAudioPeak(50);
int numLedsToLight = map(peak, 20, 600, 0, NUM_LEDS);
for (int i=0; i<numLedsToLight; i++) {
  leds[i] = CHSV(i * 5, 255, 255);
}
FastLED.show();`,
    schematicSummary: 'MAX4466 mic on A0; WS2812B data on D6 with 470Ω resistor and 1000µF capacitor across 5V.',
  },
  {
    id: 25,
    slug: 'automated-medicine-reminder',
    title: 'Automated Medicine Reminder Dispenser',
    tagline: 'RTC scheduled multi-compartment pill dispenser with chime alerts & patient compliance logging',
    image: '/iot/project-25.jpg',
    level: 'Intermediate',
    levelNum: 2,
    levelSubtitle: 'Combine Sensors | Control Systems | Build Smart Applications',
    badgeColor: '#a855f7',
    accentGlow: 'rgba(168, 85, 247, 0.2)',
    icon: '💊',
    description: 'Ensures elderly or chronic illness patients take prescribed medications on time by rotating a motorized carousel at programmed schedule slots and sounding chimes.',
    workingPrinciple: 'A DS3231 high-precision real-time clock (RTC) maintains exact calendar time with battery backup. At preset alarm timestamps (e.g. 08:00, 14:00, 20:00), a 28BYJ-48 stepper motor indexes the pill wheel by 45° to reveal the next dose.',
    realWorldImpact: 'Prevents missed or doubled medication doses among elderly patients and individuals with memory impairments.',
    sensors: ['DS3231 High-Precision I2C RTC', '28BYJ-48 Stepper Motor + ULN2003 Driver', '16x2 I2C LCD', 'Pushbutton & Buzzer'],
    microcontroller: 'Arduino Uno / Nano',
    difficulty: 'Moderate',
    estimatedHours: '5 - 8 Hours',
    pinConnections: [
      { component: 'DS3231 RTC', pin: 'SDA (A4), SCL (A5)', purpose: 'Exact real-time clock reference' },
      { component: 'Stepper ULN2003 Pins', pin: 'Pins D8, D9, D10, D11', purpose: 'Rotates pill cylinder carousel' },
      { component: 'Acknowledge Button', pin: 'Digital D2', purpose: 'Patient confirmation button' },
    ],
    keyTakeaways: ['RTC calendar synchronization', 'Stepper motor 4-phase indexing', 'Patient compliance UX'],
    codeSnippet: `DateTime now = rtc.now();
if (now.hour() == 8 && now.minute() == 0 && !alarmFired) {
  rotatePillCarousel();
  soundBuzzerUntilPressed();
  alarmFired = true;
}`,
    schematicSummary: 'DS3231 on I2C bus; ULN2003 stepper driver on D8-D11; dispense slot button on D2.',
  },

  // ─── LEVEL 3: ADVANCED (Extended Practical Projects 26 to 30) ─────────────────
  {
    id: 26,
    slug: 'iot-cloud-weather-station',
    title: 'IoT Cloud Weather Station & Air Quality Telemetry',
    tagline: 'Solar-powered environmental station with Wi-Fi MQTT telemetry & cloud dashboard',
    image: '/iot/project-26.jpg',
    level: 'Advanced',
    levelNum: 3,
    levelSubtitle: 'Build Complete Solutions | Integrate Multiple Components | Think Like a Developer',
    badgeColor: '#00e5a0',
    accentGlow: 'rgba(0, 229, 160, 0.2)',
    icon: '🌤️',
    description: 'A solar-powered outdoor station that captures atmospheric pressure, temperature, humidity, altitude, UV index, and air pollution, transmitting real-time sensor streams to cloud dashboards.',
    workingPrinciple: 'A Bosch BME280 sensor reads barometric pressure and temperature over I2C, while an MQ-135 tracks air quality. An ESP32 connects to local Wi-Fi, formats JSON telemetry, and publishes readings via MQTT to cloud dashboards (ThingSpeak / Adafruit IO / Home Assistant).',
    realWorldImpact: 'Hyper-local climate monitoring for smart agriculture, micro-weather forecasting, and urban environmental compliance in Nepal.',
    sensors: ['BME280 Barometric Pressure Sensor', 'MQ-135 Air Quality Sensor', 'Rain Optical Sensor', 'ESP32 Wi-Fi & Bluetooth MCU'],
    microcontroller: 'ESP32 Dual-Core',
    difficulty: 'Advanced',
    estimatedHours: '8 - 12 Hours',
    pinConnections: [
      { component: 'BME280 SDA / SCL', pin: 'GPIO 21, 22', purpose: 'I2C climate telemetry' },
      { component: 'MQ-135 Gas', pin: 'GPIO 34 (ADC)', purpose: 'Air pollution PPM level' },
      { component: 'Solar Charge Monitor', pin: 'GPIO 35', purpose: 'Battery voltage telemetry' },
    ],
    keyTakeaways: ['MQTT protocol publishing', 'JSON serialization with ArduinoJson', 'ESP32 Deep Sleep power management for solar cells'],
    codeSnippet: `BME280 bme;
void loop() {
  float temp = bme.readTemperature();
  float pres = bme.readPressure() / 100.0F;
  char payload[128];
  snprintf(payload, sizeof(payload), "{\\"temp\\":%.2f,\\"press\\":%.2f}", temp, pres);
  client.publish("dkode/weather", payload);
  esp_deep_sleep(10000000); // 10s deep sleep
}`,
    schematicSummary: 'ESP32 powered via TP4056 LiPo solar charger; BME280 and MQ-135 sensors on GPIO 21, 22, 34.',
  },
  {
    id: 27,
    slug: 'smart-biometric-security-vault',
    title: 'Smart Biometric Security Vault',
    tagline: 'Optical capacitive fingerprint authentication with OTP keypad & intrusion deterrent',
    image: '/iot/project-27.jpg',
    level: 'Advanced',
    levelNum: 3,
    levelSubtitle: 'Build Complete Solutions | Integrate Multiple Components | Think Like a Developer',
    badgeColor: '#00e5a0',
    accentGlow: 'rgba(0, 229, 160, 0.2)',
    icon: '🔐',
    description: 'High-security biometric safe featuring optical fingerprint image template matching, 4x4 matrix password keypad, motorized solenoid deadbolt, and tamper vibration sensors.',
    workingPrinciple: 'The R307 optical fingerprint scanner captures ridge-and-valley minutiae algorithms and compares them against onboard flash memory. If matched, the MCU powers a heavy-duty solenoid deadbolt; if 3 unauthorized attempts occur, a lockout siren fires and alerts the owner.',
    realWorldImpact: 'Bank locker security, confidential office archives, and smart firearm safety vaults.',
    sensors: ['R307 Optical Fingerprint Scanner', '4x4 Matrix Membrane Keypad', 'SW-420 Vibration Tamper Sensor', 'Heavy-Duty 12V Solenoid Deadbolt'],
    microcontroller: 'ESP32 / Arduino Mega',
    difficulty: 'Advanced',
    estimatedHours: '8 - 12 Hours',
    pinConnections: [
      { component: 'R307 Fingerprint RX/TX', pin: 'Pins D18, D19 (UART)', purpose: 'Biometric template matching' },
      { component: 'Keypad Rows & Cols', pin: 'Pins D4 to D11', purpose: '4x4 PIN passcode scanning' },
      { component: 'Solenoid Deadbolt', pin: 'Digital D12 (MOSFET)', purpose: 'Engages/retracts locking bolt' },
    ],
    keyTakeaways: ['Biometric minutiae enrollment algorithms', 'Multi-factor authentication (MFA) architectures', 'Tamper detection hardware'],
    codeSnippet: `int result = finger.getImage();
if (result == FINGERPRINT_OK && finger.image2Tz() == FINGERPRINT_OK) {
  if (finger.fingerFastSearch() == FINGERPRINT_OK) {
    unlockVault();
  }
}`,
    schematicSummary: 'R307 connected to UART; 4x4 keypad multiplexed; high-current MOSFET driving 12V deadbolt.',
  },
  {
    id: 28,
    slug: 'smart-energy-power-meter',
    title: 'IoT Smart Energy & AC Power Consumption Monitor',
    tagline: 'Non-invasive AC current transformer kilowatt-hour telemetry with live electricity bill forecasting',
    image: '/iot/project-28.jpg',
    level: 'Advanced',
    levelNum: 3,
    levelSubtitle: 'Build Complete Solutions | Integrate Multiple Components | Think Like a Developer',
    badgeColor: '#00e5a0',
    accentGlow: 'rgba(0, 229, 160, 0.2)',
    icon: '⚡',
    description: 'Measures live AC electrical current, voltage, active power (Watts), power factor, and total energy consumed (kWh) in households or commercial machines, transmitting billing forecasts to a web dashboard.',
    workingPrinciple: 'A PZEM-004T energy module interfaces with an optocoupled AC voltage tap and a split-core current transformer (CT) clamp. The ESP32 queries the module via Modbus RTU, computes energy consumption, and broadcasts data to a web dashboard.',
    realWorldImpact: 'Identifies phantom power drain in factories, tracks solar inverter net-metering, and cuts electricity bills by 25%.',
    sensors: ['PZEM-004T v3.0 Multi-function AC Energy Module', '100A Split-Core Current Transformer (CT)', 'I2C 0.96 OLED Display', 'ESP32 Wi-Fi'],
    microcontroller: 'ESP32 Dual-Core',
    difficulty: 'Advanced',
    estimatedHours: '7 - 10 Hours',
    pinConnections: [
      { component: 'PZEM-004T RX/TX', pin: 'GPIO 16, 17 (Serial2)', purpose: 'Modbus RTU energy telemetry' },
      { component: 'CT Sensor Clamp', pin: 'PZEM CT Terminals', purpose: 'Non-invasive magnetic flux current reading' },
      { component: 'OLED Display', pin: 'GPIO 21, 22', purpose: 'Displays real-time Watts & kWh' },
    ],
    keyTakeaways: ['Non-invasive AC electrical metering safety', 'Modbus RTU industrial protocol', 'Power factor and RMS energy math'],
    codeSnippet: `float voltage = pzem.voltage();
float current = pzem.current();
float power   = pzem.power();
float energy  = pzem.energy(); // in kWh
displayWattsAndBill(power, energy);`,
    schematicSummary: 'Split-core CT clamped around AC live wire; PZEM module safely isolated via optocouplers to ESP32.',
  },
  {
    id: 29,
    slug: 'ai-vision-surveillance-rover',
    title: 'AI Vision Surveillance Rover',
    tagline: 'Edge AI camera bot with pan/tilt tracking, live video streaming, & facial recognition',
    image: '/iot/project-29.jpg',
    level: 'Advanced',
    levelNum: 3,
    levelSubtitle: 'Build Complete Solutions | Integrate Multiple Components | Think Like a Developer',
    badgeColor: '#00e5a0',
    accentGlow: 'rgba(0, 229, 160, 0.2)',
    icon: '👁️',
    description: 'An advanced surveillance robot powered by an ESP32-CAM AI vision chip that streams HD video over local Wi-Fi, tracks targets using pan/tilt servos, and runs edge color/face recognition.',
    workingPrinciple: 'The OV2640 camera captures real-time frames processed by the ESP32\'s dual-core processor. An onboard web socket server streams video to a browser control dashboard. Servo motors pan and tilt the camera gimbal to track faces or colored objects.',
    realWorldImpact: 'Remote pipe/duct inspection, warehouse security patrols, and telepresence robotics.',
    sensors: ['ESP32-CAM Board with OV2640 Camera', '2x SG90 Servos (Pan/Tilt Gimbal)', 'L298N Dual Motor Driver', '4WD Chassis'],
    microcontroller: 'ESP32-CAM + Arduino Nano',
    difficulty: 'Advanced',
    estimatedHours: '10 - 15 Hours',
    pinConnections: [
      { component: 'Pan Servo', pin: 'GPIO 12', purpose: 'Horizontal camera panning 180°' },
      { component: 'Tilt Servo', pin: 'GPIO 13', purpose: 'Vertical camera tilting 90°' },
      { component: 'Flashlight LED', pin: 'GPIO 4', purpose: 'Night illumination spotlight' },
    ],
    keyTakeaways: ['MJPEG video web streaming', 'Edge computer vision on microcontrollers', 'Low-latency Wi-Fi websocket control'],
    codeSnippet: `camera_fb_t * fb = esp_camera_fb_get();
if (!fb) return ESP_FAIL;
httpd_resp_send_chunk(req, (const char *)fb->buf, fb->len);
esp_camera_fb_return(fb);`,
    schematicSummary: 'ESP32-CAM powered from dedicated 5V 2A regulator; pan/tilt servo gimbal mounted on top of chassis.',
  },
  {
    id: 30,
    slug: 'industrial-sorting-robot-arm',
    title: 'Industrial Sorting Conveyor & Robotic Arm',
    tagline: 'Automated chromatic object detection conveyor with 4-DOF pick-and-place servo robotic arm',
    image: '/iot/project-30.jpg',
    level: 'Advanced',
    levelNum: 3,
    levelSubtitle: 'Build Complete Solutions | Integrate Multiple Components | Think Like a Developer',
    badgeColor: '#00e5a0',
    accentGlow: 'rgba(0, 229, 160, 0.2)',
    icon: '🦾',
    description: 'An automated industrial assembly line replica: a motorized conveyor belt carries items past a TCS3200 color sensor, which identifies item hues and commands a 4-DOF robotic arm to pick and sort them into bins.',
    workingPrinciple: 'A TCS3200 color sensor shines white LEDs onto passing items and measures reflected red, green, and blue frequencies via a photodiode grid. The MCU computes RGB color ratios and commands inverse kinematics across four MG996R servo joints (Base, Shoulder, Elbow, Gripper) to pick and sort.',
    realWorldImpact: 'Demonstrates modern automated logistics, warehouse sorting in FMCG facilities, and robotics factory assembly.',
    sensors: ['TCS3200 / TCS34725 RGB Color Sensor', '4x MG996R High-Torque Metal Servos (4-DOF Arm)', 'Mini DC Conveyor Belt', 'IR Item Arrival Sensor'],
    microcontroller: 'Arduino Mega 2560 / ESP32',
    difficulty: 'Advanced',
    estimatedHours: '10 - 16 Hours',
    pinConnections: [
      { component: 'Color Sensor S0-S3', pin: 'Pins D22, D23, D24, D25', purpose: 'Color filter frequency scaling' },
      { component: 'Color Out Frequency', pin: 'Pin D26', purpose: 'RGB pulse train frequency input' },
      { component: '4-DOF Servo PWMs', pin: 'Pins D2, D3, D4, D5', purpose: 'Arm joint angle positioning' },
      { component: 'Conveyor Motor Driver', pin: 'Pin D7', purpose: 'Controls conveyor progression' },
    ],
    keyTakeaways: ['Photodiode array color calibration', '4-DOF inverse kinematics and trajectory planning', 'Industrial assembly line automation'],
    codeSnippet: `String color = detectColor();
if (color == "RED") {
  stopConveyor();
  pickObject();
  moveToBin(BIN_RED);
  releaseObject();
  startConveyor();
}`,
    schematicSummary: 'Arduino Mega controlling 4 metal-gear servos with separate 6V 5A power rail; TCS3200 sensor on conveyor gate.',
  },
];
