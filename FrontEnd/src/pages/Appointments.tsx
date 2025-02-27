import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Loader,
  AlertCircle
} from 'lucide-react';

// Interfaces
interface Appointment {
  id: number;
  patientName: string;
  date: string;
  time: string;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  doctor: string;
}

interface DoctorAvailability {
  id: string;
  name: string;
  schedule: {
    [key: string]: {
      availableSlots: string[];
      bookedSlots: string[];
    };
  };
}

interface CalendarGridProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

interface TimeSlotsProps {
  selectedSlot: string | null;
  onSelectSlot: (slot: string) => void;
  doctor: string;
  selectedDate: Date;
}

interface AppointmentsListProps {
  selectedDate: Date;
}

interface BookingModalProps {
  selectedDate: Date;
  selectedSlot: string | null;
  onClose: () => void;
}

interface BookingFormData {
  patientName: string;
  appointmentType: string;
  doctor: string;
  notes: string;
}

interface FormErrors {
  patientName?: string;
  appointmentType?: string;
  doctor?: string;
  slot?: string;
}

// Sample Data
const doctorsAvailability: DoctorAvailability[] = [
  {
    id: '1',
    name: 'Dr. Smith',
    schedule: {
      [new Date().toISOString().split('T')[0]]: {
        availableSlots: ['9:00', '9:30', '10:00', '10:30', '11:00'],
        bookedSlots: ['14:00', '14:30', '15:00']
      }
    }
  },
  {
    id: '2',
    name: 'Dr. Johnson',
    schedule: {
      [new Date().toISOString().split('T')[0]]: {
        availableSlots: ['13:00', '13:30', '14:00', '15:30', '16:00'],
        bookedSlots: ['9:00', '9:30', '10:00']
      }
    }
  }
];

// Main Appointments Component
const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('Dr. Smith');

  return (
    <div className="flex h-full">
      {/* Calendar and Time Slots */}
      <div className="w-2/3 p-6 bg-white rounded-lg shadow mr-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Schedule Appointments</h2>
          <div className="flex items-center space-x-4">
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="p-2 border rounded-lg"
            >
              {doctorsAvailability.map(doctor => (
                <option key={doctor.id} value={doctor.name}>
                  {doctor.name}
                </option>
              ))}
            </select>
            <ViewToggle />
          </div>
        </div>

        <CalendarGrid selectedDate={selectedDate} onSelectDate={setSelectedDate} />

        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Available Time Slots</h3>
          <TimeSlots
            selectedSlot={selectedSlot}
            onSelectSlot={setSelectedSlot}
            doctor={selectedDoctor}
            selectedDate={selectedDate}
          />
        </div>

        <div className="mt-6">
          <button
            onClick={() => setShowBookingModal(true)}
            className="w-full py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedSlot}
          >
            Book Appointment
          </button>
        </div>
      </div>

      {/* Appointments List */}
      <div className="flex-1 bg-white rounded-lg shadow p-6">
        <AppointmentsList selectedDate={selectedDate} />
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
          selectedDate={selectedDate}
          selectedSlot={selectedSlot}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedSlot(null);
          }}
        />
      )}
    </div>
  );
};

// View Toggle Component
const ViewToggle = () => {
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');

  return (
    <div className="flex space-x-2">
      <button
        onClick={() => setView('day')}
        className={`px-4 py-2 text-sm rounded-lg ${view === 'day' ? 'text-white bg-blue-600' : 'bg-white border'
          }`}
      >
        Day
      </button>
      <button
        onClick={() => setView('week')}
        className={`px-4 py-2 text-sm rounded-lg ${view === 'week' ? 'text-white bg-blue-600' : 'bg-white border'
          }`}
      >
        Week
      </button>
      <button
        onClick={() => setView('month')}
        className={`px-4 py-2 text-sm rounded-lg ${view === 'month' ? 'text-white bg-blue-600' : 'bg-white border'
          }`}
      >
        Month
      </button>
    </div>
  );
};

// Calendar Grid Component
const CalendarGrid = ({ selectedDate, onSelectDate }: CalendarGridProps) => {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const generateDays = () => {
    const days: (Date | null)[] = [];
    const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const lastDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i));
    }

    return days;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setMonth(newDate.getMonth() - 1);
              onSelectDate(newDate);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft size={20} />
          </button>
          <h3 className="text-lg font-medium">
            {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setMonth(newDate.getMonth() + 1);
              onSelectDate(newDate);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}

        {generateDays().map((date, index) => (
          <div
            key={index}
            onClick={() => date && onSelectDate(date)}
            className={`
              p-2 text-center cursor-pointer rounded-lg
              ${!date ? 'bg-transparent' : 'hover:bg-gray-50'}
              ${date && date.toDateString() === selectedDate.toDateString()
                ? 'bg-blue-50 text-blue-600'
                : ''}
            `}
          >
            {date ? (
              <div>
                <span>{date.getDate()}</span>
                {/* Add dot indicator for dates with appointments */}
                {Math.random() > 0.7 && (
                  <div className="w-1 h-1 bg-blue-600 rounded-full mx-auto mt-1"></div>
                )}
              </div>
            ) : ''}
          </div>
        ))}
      </div>
    </div>
  );
};

// Time Slots Component
const TimeSlots = ({ selectedSlot, onSelectSlot, doctor, selectedDate }: TimeSlotsProps) => {
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadAvailability = async () => {
      setIsLoading(true);
      try {
        const dateString = selectedDate.toISOString().split('T')[0];
        const doctorData = doctorsAvailability.find(d => d.name === doctor);
        const schedule = doctorData?.schedule[dateString];

        if (schedule) {
          const available = schedule.availableSlots.filter(
            slot => !schedule.bookedSlots.includes(slot)
          );
          setAvailableSlots(available);
        } else {
          setAvailableSlots([]);
        }
      } catch (error) {
        console.error('Error loading availability:', error);
        setAvailableSlots([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAvailability();
  }, [doctor, selectedDate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader className="animate-spin h-5 w-5 text-blue-600" />
      </div>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        No available slots for this date
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      {availableSlots.map((time) => (
        <button
          key={time}
          onClick={() => onSelectSlot(time)}
          className={`
            p-2 text-sm rounded-lg border
            ${selectedSlot === time
              ? 'bg-blue-50 border-blue-600 text-blue-600'
              : 'hover:bg-gray-50'}
          `}
        >
          {time}
        </button>
      ))}
    </div>
  );
};

// Appointments List Component
const AppointmentsList = ({ selectedDate }: AppointmentsListProps) => {
  const appointments: Appointment[] = [
    {
      id: 1,
      patientName: 'Sarah Johnson',
      date: selectedDate.toISOString().split('T')[0],
      time: '10:00',
      type: 'Check-up',
      status: 'scheduled',
      doctor: 'Dr. Smith'
    },
    {
      id: 2,
      patientName: 'Michael Brown',
      date: selectedDate.toISOString().split('T')[0],
      time: '11:30',
      type: 'Consultation',
      status: 'completed',
      doctor: 'Dr. Wilson'
    }
  ];

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-800 mb-4">
        Appointments for {selectedDate.toLocaleDateString()}
      </h3>
      <div className="space-y-3">
        {appointments.map(appointment => (
          <div
            key={appointment.id}
            className="p-4 border rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-800">
                  {appointment.patientName}
                </h4>
                <p className="text-sm text-gray-500">{appointment.type}</p>
              </div>
              <span className="text-sm text-gray-500">{appointment.time}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-gray-500">{appointment.doctor}</span>
              <span className={`
                px-2 py-1 text-xs rounded-full
                ${appointment.status === 'scheduled' ? 'bg-green-100 text-green-800' : ''}
                ${appointment.status === 'completed' ? 'bg-gray-100 text-gray-800' : ''}
                ${appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
              `}>
                {appointment.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Doctor Availability Component
const DoctorAvailabilityCheck = ({
  doctor,
  selectedDate,
  selectedSlot,
  onSlotAvailabilityChange
}: {
  doctor: string;
  selectedDate: Date;
  selectedSlot: string | null;
  onSlotAvailabilityChange: (isAvailable: boolean) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [availability, setAvailability] = useState<{
    availableSlots: string[];
    bookedSlots: string[];
  } | null>(null);

  useEffect(() => {
    const checkAvailability = async () => {
      setIsLoading(true);
      try {
        const dateString = selectedDate.toISOString().split('T')[0];
        const doctorData = doctorsAvailability.find(d => d.name === doctor);
        const schedule = doctorData?.schedule[dateString];

        if (schedule) {
          setAvailability(schedule);
          const isAvailable = selectedSlot ?
            schedule.availableSlots.includes(selectedSlot) &&
            !schedule.bookedSlots.includes(selectedSlot) :
            false;
          onSlotAvailabilityChange(isAvailable);
        } else {
          setAvailability(null);
          onSlotAvailabilityChange(false);
        }
      } catch (error) {
        console.error('Error checking availability:', error);
        onSlotAvailabilityChange(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAvailability();
  }, [doctor, selectedDate, selectedSlot, onSlotAvailabilityChange]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader className="animate-spin h-5 w-5 text-blue-600" />
      </div>
    );
  }

  if (!availability) {
    return (
      <div className="mt-2 p-3 bg-yellow-50 text-yellow-700 rounded-lg">
        No availability information for {doctor} on {selectedDate.toLocaleDateString()}
      </div>
    );
  }

  const isSelectedSlotAvailable = selectedSlot ?
    availability.availableSlots.includes(selectedSlot) &&
    !availability.bookedSlots.includes(selectedSlot) :
    false;

  return (
    <div className="mt-2 space-y-3">
      <div className={`p-3 rounded-lg ${isSelectedSlotAvailable
          ? 'bg-green-50 text-green-700'
          : 'bg-red-50 text-red-700'
        }`}>
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${isSelectedSlotAvailable ? 'bg-green-600' : 'bg-red-600'
            }`}></div>
          <span>
            {selectedSlot ? (
              isSelectedSlotAvailable ? (
                `Available: ${doctor} is available at ${selectedSlot}`
              ) : (
                `Not Available: ${doctor} is not available at ${selectedSlot}`
              )
            ) : (
              'Please select a time slot'
            )}
          </span>
        </div>
      </div>

      <div className="text-sm">
        <h4 className="font-medium text-gray-700 mb-1">Available Time Slots:</h4>
        <div className="bg-gray-50 p-2 rounded-lg">
          {availability.availableSlots
            .filter(slot => !availability.bookedSlots.includes(slot))
            .map((slot, index, array) => (
              <span
                key={slot}
                className={`inline-block px-2 py-1 rounded ${selectedSlot === slot ? 'bg-blue-100 text-blue-700' : ''
                  }`}
              >
                {slot}
                {index < array.length - 1 ? ', ' : ''}
              </span>
            ))}
        </div>
      </div>
    </div>
  );
};

// Booking Modal Component
const BookingModal = ({ selectedDate, selectedSlot, onClose }: BookingModalProps) => {
  const [formData, setFormData] = useState<BookingFormData>({
    patientName: '',
    appointmentType: 'Regular Check-up',
    doctor: 'Dr. Smith',
    notes: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isSlotAvailable, setIsSlotAvailable] = useState(true);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.patientName.trim()) {
      newErrors.patientName = 'Patient name is required';
    }
    if (!formData.appointmentType) {
      newErrors.appointmentType = 'Appointment type is required';
    }
    if (!formData.doctor) {
      newErrors.doctor = 'Doctor selection is required';
    }
    if (!isSlotAvailable) {
      newErrors.slot = 'Selected time slot is not available';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setBookingStatus('loading');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate successful booking
      setBookingStatus('success');

      // Reset form after success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setBookingStatus('error');
      console.error('Error booking appointment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (bookingStatus === 'success') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Appointment Booked!</h3>
            <p className="mt-2 text-sm text-gray-500">
              Your appointment has been successfully scheduled for {selectedDate.toLocaleDateString()} at {selectedSlot}
            </p>
            <div className="mt-4">
              <button
                onClick={onClose}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (bookingStatus === 'error') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Booking Failed</h3>
            <p className="mt-2 text-sm text-gray-500">
              There was an error booking your appointment. Please try again.
            </p>
            <div className="mt-4 flex space-x-3 justify-center">
              <button
                onClick={() => setBookingStatus('idle')}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Try Again
              </button>
              <button
                onClick={onClose}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800">Book Appointment</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient Name
            </label>
            <input
              type="text"
              value={formData.patientName}
              onChange={(e) => {
                setFormData({ ...formData, patientName: e.target.value });
                if (errors.patientName) {
                  setErrors({ ...errors, patientName: undefined });
                }
              }}
              className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
                ${errors.patientName ? 'border-red-500' : ''}`}
              placeholder="Enter patient name"
              disabled={isSubmitting}
            />
            {errors.patientName && (
              <p className="mt-1 text-xs text-red-500">{errors.patientName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Appointment Type
            </label>
            <select
              value={formData.appointmentType}
              onChange={(e) => setFormData({ ...formData, appointmentType: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              <option>Regular Check-up</option>
              <option>Consultation</option>
              <option>Follow-up</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Doctor
            </label>
            <select
              value={formData.doctor}
              onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              <option>Dr. Smith</option>
              <option>Dr. Johnson</option>
              <option>Dr. Williams</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date & Time
            </label>
            <div className="p-2 bg-gray-50 rounded-lg text-sm">
              {selectedDate.toLocaleDateString()} at {selectedSlot}
            </div>
          </div>

          <DoctorAvailabilityCheck
            doctor={formData.doctor}
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            onSlotAvailabilityChange={setIsSlotAvailable}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Add any additional notes..."
              disabled={isSubmitting}
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !isSlotAvailable}
              className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 
                disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Booking...
                </>
              ) : (
                'Confirm Booking'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;