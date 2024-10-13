const Database = require("../../../connections/connection");
const uploadToS3 = require("../../../helpers/amazons3");
const Auth = Database.user;
const Form = Database.form;
const ListenerProfile = Database.listenerProfile;
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
      !panCard
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const uploads = await Promise.allSettled([
      uploadToS3(profileImage, "profiles"),
      uploadToS3(displayImage, "profiles"),
      uploadToS3(adharFront, "proofs"),
      uploadToS3(adharBack, "proofs"),
      uploadToS3(panCard, "proofs"),
    ]);

    const [
      profileImageUrl,
      displayImageUrl,
      adharFrontUrl,
      adharBackUrl,
      panCardUrl,
    ] = uploads.map((result) =>
      result.status === "fulfilled" ? result.value : null
    );

    if (
      !profileImageUrl ||
      !displayImageUrl ||
      !adharFrontUrl ||
      !adharBackUrl ||
      !panCardUrl
    ) {
      return res.status(500).json({ message: "Failed to upload some files." });
    }

    const newListenerProfile = await ListenerProfile.create({
      listenerId,
      display_name,
      gender,
      age,
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
    });

    Auth.update(
      { listener_request_status: "documents in review" },
      { where: { id: listenerId } }
    ).catch((error) => console.error("Error updating listener status:", error));

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
      describe_yourself,
      dob,
      mobile_number,
      email,
      resume,
      question1,
      answer1,
      question2,
      answer2,
      question3,
      answer3,
      question4,
      answer4,
      question5,
      answer5,
    } = req.body;
    const formData = {
      userId,
      fullName,
      gender,
      describe_yourself,
      dob,
      mobile_number,
      email,
      resume,
      question1,
      answer1,
      question2,
      answer2,
      question3,
      answer3,
      question4,
      answer4,
      question5,
      answer5,
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
const setAvailabilityForVideoCall = async (req, res) => {
  const { userId, status } = req.body;

  try {
    const user = await Auth.findOne({
      where: { id: userId, role: "listener" },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    await Auth.update(
      {
        is_video_call: status,
        listener_request_status: "approved",
        role: "listener",
      },
      { where: { id: userId } }
    );

    return res.status(200).json({
      message: `User's video call availability set true`,
      is_video_call: status,
    });
  } catch (error) {
    console.error("Error updating listener request status:", error);
    return res.status(500).json({
      message: "Error updating listener request status",
      error: error.message,
    });
  }
};

module.exports = {
  listenerRequest,
  submitForm,
  storeListenerProfile,
  setAvailabilityForVideoCall,
};
