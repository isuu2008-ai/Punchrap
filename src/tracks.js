(() => {
  const DEFAULT_TRACK_NAMES = {
    main: "Main",
    double: "Double",
    "adlib-l": "Adlib L",
    "adlib-r": "Adlib R",
    hook: "Hook",
  };

  function getDefaultTrackName(trackId) {
    return DEFAULT_TRACK_NAMES[trackId] || "Track";
  }

  function hasSoloTrack(tracks = []) {
    return (Array.isArray(tracks) ? tracks : []).some((track) => track.solo);
  }

  function isTrackAudible(track, tracks = []) {
    if (!track) {
      return false;
    }

    return hasSoloTrack(tracks) ? track.solo && !track.muted : !track.muted;
  }

  function getTrackOutputVolume(track, tracks = []) {
    return isTrackAudible(track, tracks) ? Number(track.volume) || 0 : 0;
  }

  function hasTrackFolder(folderId, trackFolders = []) {
    return (Array.isArray(trackFolders) ? trackFolders : []).some((folder) => folder.id === folderId);
  }

  function getTrackFolderTracks(folderId, trackFolders = [], tracks = []) {
    const folder = (Array.isArray(trackFolders) ? trackFolders : []).find((item) => item.id === folderId);
    if (!folder) {
      return [];
    }

    return (Array.isArray(folder.trackIds) ? folder.trackIds : [])
      .map((trackId) => (Array.isArray(tracks) ? tracks : []).find((track) => track.id === trackId))
      .filter(Boolean);
  }

  function getFolderedTrackIds(trackFolders = []) {
    return new Set((Array.isArray(trackFolders) ? trackFolders : []).flatMap((folder) => folder.trackIds || []));
  }

  function normalizeTrackFolderCollapsed(value = {}, trackFolders = []) {
    return Object.fromEntries((Array.isArray(trackFolders) ? trackFolders : []).map((folder) => [folder.id, Boolean(value?.[folder.id])]));
  }

  window.PunchLabTracks = {
    getDefaultTrackName,
    getFolderedTrackIds,
    getTrackFolderTracks,
    getTrackOutputVolume,
    hasSoloTrack,
    hasTrackFolder,
    isTrackAudible,
    normalizeTrackFolderCollapsed,
  };
})();
