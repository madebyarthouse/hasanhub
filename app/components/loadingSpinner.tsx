const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center gap-3">
      <span className="sr-only">Loading...</span>
      <div
        className="bg-twitchPurple h-10 w-3"
        style={{
          animationDuration: "1000ms",
          animationName: "pulse",
          animationIterationCount: "infinite",
        }}
      ></div>
      <div
        className="bg-twitchPurple h-10 w-3"
        style={{
          animationDuration: "1500ms",
          animationName: "pulse",
          animationIterationCount: "infinite",
        }}
      ></div>
      <div
        className="bg-twitchPurple h-10 w-3"
        style={{
          animationDuration: "2000ms",
          animationName: "pulse",
          animationIterationCount: "infinite",
        }}
      ></div>
    </div>
  );
};

export default LoadingSpinner;
