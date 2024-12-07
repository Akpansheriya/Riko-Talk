const Database = require("../../../connections/connection");
const uploadToS3 = require("../../../helpers/amazons3");
const Auth = Database.user;
const Form = Database.form;
const ListenerProfile = Database.listenerProfile;
const Questions = Database.questions;
const listenerRequest = async (req, res) => {
  const userId = req.body.id;

  try {
    const user = await Auth.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await Auth.update(
      { listener_request_status: "pending" },
      { where: { id: userId } }
    );

    return res.status(200).json({
      message: "User listener request status updated to pending",
    });
  } catch (error) {
    console.error("Error updating listener request status:", error);
    return res.status(500).json({
      message: "Error updating listener request status",
      error: error.message,
    });
  }
};
const storeListenerProfile = async (req, res) => {
  try {
    const {
      listenerId,
      display_name,
      gender,
      age,
      topic,
      service,
      about,
      call_availability_duration,
      dob,
      languages
    } = req.body;

    const profileImage = req?.files?.profileImage?.[0];
    const displayImage = req?.files?.displayImage?.[0];
    const adharFront = req?.files?.adharFront?.[0];
    const adharBack = req?.files?.adharBack?.[0];
    const panCard = req?.files?.pancard?.[0];

    if (
      !listenerId ||
      !display_name ||
      !gender ||
      !age ||
      !topic ||
      !service ||
      !about ||
      !call_availability_duration ||
      !dob ||
      !profileImage ||
      !displayImage ||
      !adharFront ||
      !adharBack ||
      !panCard || !languages
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Upload files to S3 one by one
    const profileImageUrl = await uploadToS3(profileImage, "profiles");
    const displayImageUrl = await uploadToS3(displayImage, "profiles");
    const adharFrontUrl = await uploadToS3(adharFront, "proofs");
    const adharBackUrl = await uploadToS3(adharBack, "proofs");
    const panCardUrl = await uploadToS3(panCard, "proofs");

    // Store URLs in the database
    const newListenerProfile = await ListenerProfile.create({
      listenerId,
      display_name,
      gender,
      age: parseInt(age),
      topic,
      service,
      about,
      call_availability_duration,
      dob,
      image: profileImageUrl,
      display_image: displayImageUrl,
      adhar_front: adharFrontUrl,
      adhar_back: adharBackUrl,
      pancard: panCardUrl,
      voice_charge: 6,
      chat_charge: 6,
      video_charge: 15,
      languages:languages
    });

    // Update listener status
    await Auth.update(
      { listener_request_status: "documents in review" },
      { where: { id: listenerId } }
    );

    res.status(201).json({
      message: "Listener profile created successfully.",
      profile: newListenerProfile,
    });
  } catch (error) {
    console.error("Error storing listener profile:", error);
    res.status(500).json({
      message: "Error storing listener profile.",
      error: error.message,
    });
  }
};
const submitForm = async (req, res) => {
  try {
    const {
      userId,
      fullName,
      gender,
      dob,
      mobile_number,
      email,
      audio,
      reference,
      answer1,
      answer2,
      answer3,
      answer4,
    } = req.body;

    const resumeFile = req?.files?.resume?.[0];
    if (!resumeFile || !audio) {
      return res
        .status(400)
        .json({ message: "Resume and audio are required." });
    }

    const resumeUrl = await uploadToS3(resumeFile, "resumes");
    const matches = audio.match(/^data:(.+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ message: "Invalid audio format." });
    }
    const audioBuffer = Buffer.from(matches[2], "base64");
    const audioMimeType = matches[1];
    const audioFile = {
      buffer: audioBuffer,
      originalname: `audio-message-${Date.now()}.webm`,
      mimetype: audioMimeType,
    };
    const audioUrl = await uploadToS3(audioFile, "audios");
    const questions = await Questions.findOne({
      where: { id: "b82d75e2-5e32-4f2f-820d-c59506302e63" },
    });

    const formData = {
      userId,
      fullName,
      gender,
      dob,
      mobile_number,
      email,
      audio: audioUrl,
      reference,
      resume: resumeUrl,
      question1: questions.question1,
      answer1,
      question2: questions.question2,
      answer2,
      question3: questions.question3,
      answer3,
      question4: questions.question4,
      answer4,
    };

    const newForm = await Form.create(formData);

    if (userId) {
      await Auth.update(
        { listener_request_status: "confirmation request" },
        { where: { id: userId } }
      );
    }

    return res.status(201).json({
      message: "Form submitted successfully",
      form: newForm,
    });
  } catch (error) {
    console.error("Error submitting form:", error);
    return res.status(500).json({
      message: "Error submitting form",
      error: error.message,
    });
  }
};
const updateCharges = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).send({ message: "No fields provided for update" });
    }

    const charges = await ListenerProfile.findOne({
      where: { listenerId: id },
    });

    if (!charges) {
      return res.status(404).send({ message: "charges data not found" });
    }

    await charges.update(updates);

    res.status(200).send({
      message: "charges data updated successfully",
      plan: charges,
    });
  } catch (error) {
    console.error("Error updating charges data:", error);
    res.status(500).send({
      message: "Error updating charges data",
      error: error.message,
    });
  }
};

module.exports = {
  listenerRequest,
  submitForm,
  storeListenerProfile,
  updateCharges,
};
