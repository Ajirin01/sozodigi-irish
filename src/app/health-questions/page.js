"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";
import { useRouter } from 'next/navigation';
import { postData } from "@/utils/api";


const steps = [
  "Basic Info",
  "General",
  "Headaches & Balance",
  "Vision",
  "ENT",
  "Heart",
  "Respiratory",
  "Stomach & Bowel",
  "Urinary",
  "Back & Joints",
  "Skin",
  "Mental Health",
];

const stepKeys = [
  null,
  "general",
  "headachesAndBalance",
  "vision",
  "ent",
  "heart",
  "respiratory",
  "stomachAndBowel",
  "urinary",
  "backAndJoints",
  "skin",
  "mentalHealth",
];

const initialState = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  date: "",
  gender: "Male",
  general: {
    goodHealth: false,
    fatigue: false,
    weightGain: false,
    weightLoss: false,
    familyMedicalHistory: false,
  },
  headachesAndBalance: {
    severeHeadaches: false,
    numbness: false,
    dizziness: false,
  },
  vision: {
    visionChanges: false,
    doubleVision: false,
    eyeInfections: false,
    eyeIrritation: false,
  },
  ent: {
    hearingProblems: false,
    earBuzzing: false,
    earInfections: false,
    sinusProblems: false,
    dentalProblems: false,
    mouthSores: false,
    chewingDifficulty: false,
  },
  heart: {
    chestPain: false,
    palpitations: false,
    legSwelling: false,
  },
  respiratory: {
    breathShortness: false,
    cough: false,
    wheezing: false,
    mucus: false,
  },
  stomachAndBowel: {
    nausea: false,
    indigestion: false,
    swallowingProblem: false,
    stomachPain: false,
    diarrhoea: false,
    constipation: false,
    bowelChange: false,
    stoolColorChange: false,
    bloodInStool: false,
  },
  urinary: {
    urineProblems: false,
    frequentUrination: false,
    painUrination: false,
    bloodInUrine: false,
    incontinence: false,
    urgency: false,
    nightUrination: false,
  },
  backAndJoints: {
    backNeckProblems: false,
    jointProblems: false,
    jointSwelling: false,
  },
  skin: {
    skinProblems: false,
    moleConcerns: false,
  },
  mentalHealth: {
    depression: false,
    anxiety: false,
    sleepProblems: false,
  },
};

function camelToLabel(str) {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase());
}

export default function HealthQuestionnaireForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const { user } = useUser();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { addToast } = useToast();

  const alertSuccess = (msg) => addToast(msg, "success");
  const alertError = (msg) => addToast(msg, "error");

  const token = session?.user?.jwt;

  useEffect(() => {
    if (!user) return; // Wait for user data to be available

    // console.log(user)
  
    const saved = sessionStorage.getItem("healthQuestionnaire");

    console.log(saved)
  
    // Default user data (safe fallback)
    const safeUser = {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phone: user.phone || "",
    };
  
    // If saved data exists in sessionStorage
    if (saved) {
      const parsed = JSON.parse(saved);
  
      // Merge saved data with user data, ensuring the user details take precedence
      setFormData((prev) => ({
        ...prev,
        ...parsed, // preserve saved data
        ...safeUser, // override with latest user data
      }));
    } else {
      // If no saved data, initialize with user data
      setFormData((prev) => ({
        ...prev,
        ...safeUser,
      }));

    sessionStorage.setItem("healthQuestionnaire", JSON.stringify(formData));

    }
  }, [user]); // Dependency on user so it triggers when user data is available  

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const handleChange = (section, key, value) => {
    setFormData((prev) => {
      let updatedFormData;
  
      if (!section) {
        updatedFormData = { ...prev, [key]: value };
      } else {
        updatedFormData = {
          ...prev,
          [section]: { ...prev[section], [key]: value },
        };
      }

      // Save the updated form data to sessionStorage
      sessionStorage.setItem("healthQuestionnaire", JSON.stringify(updatedFormData));
  
      return updatedFormData;
    });
  };
  

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
      console.log(formData)

      // Save the form data to sessionStorage when moving to the next step
      sessionStorage.setItem("healthQuestionnaire", JSON.stringify(formData));

      console.log(sessionStorage.getItem("healthQuestionnaire"))
    }
  };
  
  const handleBack = () => {
    if (step > 0) {
      setStep((s) => s - 1);
      // Save the form data to sessionStorage when moving to the previous step
      sessionStorage.setItem("healthQuestionnaire", JSON.stringify(formData));
    }
  };
  

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
    //   console.log("Submit form data:", formData);
        formData.user = session.user?.id
      await postData("health-questionnaires/create/custom", formData, token);
      sessionStorage.removeItem("healthQuestionnaire");
      alertSuccess("Form submitted successfully!");

      const loginRes = await signIn('credentials', {
        redirect: false,
        email: user.email,
        token: token,
        callbackUrl: '/admin',
      });

      if(loginRes.ok){
        router.push(loginRes.url)
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alertError("There was an error submitting the form.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    if (step === 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[ 
            { label: "First Name", name: "firstName", type: "text" },
            { label: "Last Name", name: "lastName", type: "text" },
            { label: "Phone", name: "phone", type: "tel" },
            { label: "Email", name: "email", type: "email" },
          ].map(({ label, name, type }) => (
            <div key={name}>
              <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
                {label}
              </label>
              <input
                id={name}
                type={type}
                className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData[name]}
                onChange={(e) => handleChange(null, name, e.target.value)}
              />
            </div>
          ))}

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              id="date"
              className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.date}
              onChange={(e) => handleChange(null, "date", e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              id="gender"
              className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.gender}
              onChange={(e) => handleChange(null, "gender", e.target.value)}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>
      );
    }

    const sectionKey = stepKeys[step];
    const section = formData[sectionKey];

    // Define questions for each section
    const sectionQuestions = {
      general: [
        { question: "Would you say you are in good general health?", key: "goodHealth" },
        { question: "Any severe fatigue or tiredness?", key: "fatigue" },
        { question: "Any recent significant weight gain?", key: "weightGain" },
        { question: "Any recent significant weight loss?", key: "weightLoss" },
        { question: "Any history of serious medical conditions in your immediate family?", key: "familyMedicalHistory" },
      ],
      headachesAndBalance: [
        { question: "Do you get severe headaches or migraines?", key: "severeHeadaches" },
        { question: "Any numbness or pins and needle in your arms or legs?", key: "numbness" },
        { question: "Any episodes of dizziness or balance problems?", key: "dizziness" },
      ],
      vision: [
        { question: "Have you had any recent changes in your vision?", key: "visionChanges" },
        { question: "Any episodes of double vision?", key: "doubleVision" },
        { question: "Any recent eye infections?", key: "eyeInfections" },
        { question: "Any eye irritation or dryness or watering?", key: "eyeIrritation" },
      ],
      ent: [
        { question: "Have you had any hearing problems?", key: "hearingProblems" },
        { question: "Any ringing or buzzing in your ears?", key: "earBuzzing" },
        { question: "Any ear infections or discharge from your ears?", key: "earInfections" },
        { question: "Any sinus or nasal problems?", key: "sinusProblems" },
        { question: "Any recent dental problems?", key: "dentalProblems" },
        { question: "Any mouth ulcers or sores?", key: "mouthSores" },
        { question: "Any difficulty chewing or eating?", key: "chewingDifficulty" },
      ],
      heart: [
        { question: "Do you ever get chest pain?", key: "chestPain" },
        { question: "Any palpitations or episodes of your heart racing?", key: "palpitations" },
        { question: "Any swelling in your legs or ankles?", key: "legSwelling" },
      ],
      respiratory: [
        { question: "Have you been getting more short of breath than usual?", key: "breathShortness" },
        { question: "Any cough?", key: "cough" },
        { question: "Any wheezing?", key: "wheezing" },
        { question: "Any mucous or sputum?", key: "mucus" },
      ],
      stomachAndBowel: [
        { question: "Do you get frequent episodes of nausea or vomiting?", key: "nausea" },
        { question: "Any indigestion, heartburn or acid reflux?", key: "indigestion" },
        { question: "Any problems swallowing - does food ever get stuck?", key: "swallowingProblem" },
        { question: "Any severe stomach or abdominal pains?", key: "stomachPain" },
        { question: "Any regular problem with diarrhoea?", key: "diarrhoea" },
        { question: "Any regular problem with constipation?", key: "constipation" },
        { question: "Any recent changes in your bowel movement (frequency etc)?", key: "bowelChange" },
        { question: "Any persistent change in stool colour?", key: "stoolColorChange" },
        { question: "Any blood or mucous in the stool?", key: "bloodInStool" },
      ],
      urinary: [
        { question: "Do you have any urinary problems?", key: "urineProblems" },
        { question: "Do you frequently need to urinate?", key: "frequentUrination" },
        { question: "Do you experience pain or burning during urination?", key: "painUrination" },
        { question: "Any blood in the urine?", key: "bloodInUrine" },
        { question: "Do you have any urinary incontinence (inability to hold urine)?", key: "incontinence" },
        { question: "Do you often feel an urgency to urinate?", key: "urgency" },
        { question: "Do you frequently wake up at night to urinate?", key: "nightUrination" },
      ],
      backAndJoints: [
        { question: "Do you suffer from any back or neck problems?", key: "backNeckProblems" },
        { question: "Do you have pain or stiffness in your joints?", key: "jointProblems" },
        { question: "Do you have any joint swelling?", key: "jointSwelling" },
      ],
      skin: [
        { question: "Do you have any skin issues?", key: "skinProblems" },
        { question: "Do you have any moles or growths that concern you?", key: "moleConcerns" },
      ],
      mentalHealth: [
        { question: "Do you feel depressed or sad for extended periods?", key: "depression" },
        { question: "Do you feel anxious or nervous often?", key: "anxiety" },
        { question: "Do you have trouble sleeping or suffer from insomnia?", key: "sleepProblems" },
      ],
    };

    return (
      <div>
        {sectionQuestions[sectionKey].map(({ question, key }) => (
          <div key={key} className="mb-4">
            <label className="block text-sm font-medium text-gray-700">{question}</label>
            <div className="mt-2">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name={key}
                  checked={section[key] === true}
                  onChange={() => handleChange(sectionKey, key, true)}
                  className="h-4 w-4 text-blue-500 border-gray-300"
                />
                <span className="ml-2">Yes</span>
              </label>
              <label className="inline-flex items-center ml-4">
                <input
                  type="radio"
                  name={key}
                  checked={section[key] === false}
                  onChange={() => handleChange(sectionKey, key, false)}
                  className="h-4 w-4 text-blue-500 border-gray-300"
                />
                <span className="ml-2">No</span>
              </label>
            </div>
          </div>
        ))}
      </div>
    );
    
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg mt-20 mb-20">
        <div className="text-sm text-gray-700 mt-5 mb-10 font-semibold">
            Kindly complete the health questionnaire to continue accessing your dashboard. Your responses enable us to deliver personalized and high-quality healthcare services tailored to your needs.
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
            />
        </div>


        <form>
        <div className="mb-6">
            <div className="text-lg font-semibold">{steps[step]}</div>
        </div>

        {renderStep()}

        <div className="mt-8 flex justify-between">
            {step > 0 && (
            <button
                type="button"
                onClick={handleBack}
                className="py-2 px-4 bg-gray-300 rounded-md"
            >
                Back
            </button>
            )}
            <p className="text-sm text-gray-600 mb-2 text-center">
                Step {step + 1} of {steps.length}
            </p>
            {step < steps.length - 1 ? (
            <button
                type="button"
                onClick={handleNext}
                className="py-2 px-4 bg-blue-500 text-white rounded-md"
            >
                Next
            </button>
            ) : (
            <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`py-2 px-4 ${isSubmitting ? "bg-gray-400" : "bg-blue-500"} text-white rounded-md`}
            >
                {isSubmitting ? "Submitting..." : "Submit"}
            </button>
            )}
        </div>
        </form>
    </div>
  );
}
